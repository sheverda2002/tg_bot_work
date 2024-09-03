const TelegramApi = require("node-telegram-bot-api")
const mongoose = require("mongoose");
const UserSchema = require('./models/UserSchema')
const express = require("express");
const axios = require("axios");
require('dotenv').config()
const token = "7405132392:AAE3O66Jup-OMx7seX8GRwsCj7mZYZCo6bw"
const dbURI = 'mongodb+srv://nsewerda04:soket775@cluster0.kkg0ems.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
const adminID = 6793605665;
const PORT = process.env.PORT || 3000;
const profitsChatId = -1002222723133;
const CuratorSchema = require('./models/curatorSchema')



const ourCuratorID = 5578275445;



let userState = {}

let escortAddModelMsgId = {

}

let new_model_escort = {

}




const bot = new TelegramApi(token, {polling: true});



const app = express()

app.get("/", async (req, res) => {
    res.send("Work!");
})

app.listen(PORT, ()=> {
    console.log('Server has been working')
})


mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err))




bot.onText(/\/start/, async (msg) => {
    userState = {}
    escortAddModelMsgId = {}
    new_model_escort = {}
    const chatId = msg.chat.id;
    const user = await UserSchema.findOne({id_user: msg.from.id})
    const replyKeyboard = {
        reply_markup: {
            keyboard: [
                [{ text: '👤 Профиль'}, { text: '💋 ESCORT'}],
                [{text: "О проекте 🧑‍💻"}]
            ],
            resize_keyboard: true, // Изменить размер клавиатуры в зависимости от количества кнопок
            one_time_keyboard: true // Скрыть клавиатуру после нажатия кнопки
        }
    };
    let profile_text  = `<b>⚡️ Профиль @${user.user_name}</b>\n` +
        `<b>👤 ID: ${user.id_user}</b>\n\n` +
        `<b>💳 Ваш кошелёк</b>\n` +
        `├ Баланс: ${user.balance}₽\n` +
        `└ Заморожено: ${user.frozen_balance}₽\n\n` +
        `🥳Ваши профиты\n` +
        `┗ Сделано профитов на сумму ${user.profits}₽`
    await bot.sendMessage(chatId, "⚡", replyKeyboard)
    const curators = await CuratorSchema.find()
    let curator_is_added = false
    curators[0].users.forEach(user => {
        if (user.id_user === msg.from.id) {
            curator_is_added = true
        }
    })
    let buttons = []
    if (curator_is_added) {
        buttons = [
            [{text: "💲Оформить выплату", callback_data: "make_payment"}],
            [{text: `Ваш куратор - ${curators[0].name}`, callback_data: "my_curator"}]
        ]
    } else if (curator_is_added === false) {
        buttons = [
            [{text: "💲Оформить выплату", callback_data: "make_payment"}],
            [{text: "👨‍🏫 Нанять куратора", callback_data: "add_curator"}]
        ]
    }
    await bot.sendMessage(chatId, profile_text, {parse_mode: "HTML", reply_markup: JSON.stringify({
            inline_keyboard: buttons
        })});
})

bot.onText('/curator', async (msg) => {
    const chatId = msg.chat.id;
    console.log(msg.from.id === ourCuratorID)
    if (msg.from.id === ourCuratorID) {
        const curators = await CuratorSchema.find()
        let usersText = '';
        if (curators[0].users.length > 0) {
            curators[0].users.forEach(user => {
                usersText = usersText + `@${user.user_name} (ID: ${user.id_user}) - ${user.profits}/5 профитов\n`
            })
        } else if (curators[0].users.length <= 0) {
            usersText = "Учеников нету 🚫"
        }
        await bot.sendMessage(chatId, usersText, {parse_mode: "HTML", reply_markup: JSON.stringify({})})
    }


})

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    if (msg.text === "👤 Профиль") {
        if (msg.from.username) {
            await UserSchema.updateOne({id_user: msg.from.id}, {
                $set: {
                    user_name: msg.from.username
                }
            })
        }
        const user = await UserSchema.findOne({id_user: msg.from.id})
        const curators = await CuratorSchema.find()
        let curator_is_added = false
        curators[0].users.forEach(user => {
            if (user.id_user === msg.from.id) {
                curator_is_added = true
            }
        })
        let buttons = []
        if (curator_is_added) {
            buttons = [
                [{text: "💲Оформить выплату", callback_data: "make_payment"}],
                [{text: `Ваш куратор - ${curators[0].name}`, callback_data: "my_curator"}]
            ]
        } else if (curator_is_added === false) {
            buttons = [
                [{text: "💲Оформить выплату", callback_data: "make_payment"}],
                [{text: "👨‍🏫 Нанять куратора", callback_data: "add_curator"}]
            ]
        }
        let profile_text  = `<b>⚡️ Профиль @${user.user_name}</b>\n` +
            `<b>👤 ID: ${user.id_user}</b>\n\n` +
            `<b>💳 Ваш кошелёк</b>\n` +
            `├ Баланс: ${user.balance}₽\n` +
            `└ Заморожено: ${user.frozen_balance}₽\n\n` +
            `🥳Ваши профиты\n` +
            `┗ Сделано профитов на сумму ${user.profits}₽`

        // await bot.sendPhoto(chatId, "images/worker2.jpg", {
        //     caption: profile_text,
        //     parse_mode: "HTML",
        //     reply_markup: JSON.stringify({
        //         inline_keyboard: [
        //             [{text: "💲Оформить выплату", callback_data: "make_payment"}],
        //             [{text: "⚙ Настройки", callback_data: "settings"}]
        //         ]
        //     })
        // })

        await bot.sendMessage(chatId, profile_text, {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: buttons
            })});
    } else if (msg.text === "О проекте 🧑‍💻") {
        const text = "<b>🌐 Информация INFINITY TEAM</b>\n\n" +
            `<b>👤 Проценты воркера\n</b>` +
            `<b>┣ Пополнение: 80%</b>\n` +
            `<b>┣ Пополнение ТП: 65%</b>\n` +
            `<b>┖ Обнал: 60%</b>\n\n` +
            "<b>🔗 Ссылка для друга (3% с каждого профита)</b>\n" +
            "┖ <a>https://t.me/InfTeamAppBot?start=984978132</a>\n\n" +
            `<b>📈 Основные направления работы</b>\n` +
            `<b>┣ ESCORT</b>\n` +
            `<b>┣ TRADE (в разработке)</b>\n` +
            `<b>┣ NFT (в разработке)</b>\n` +
            `<b>┣ CASINO (в разработке)</b>\n` +
            `<b>┖ EXCHANGER (в разработке)</b>`
        await bot.sendPhoto(chatId, "images/welcome.jpg", {
            caption: text,
            parse_mode: "HTML"
        })
    } else if (msg.text === "💋 ESCORT") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        let buttons = []
        if (user?.escort_model.length > 0) {
            buttons = user?.escort_model.map((bot, index) => {
                return [{ text: `${bot.name} · ${bot.age}`, callback_data: `select_model_bot_${index}` }];
            });
        }
        buttons.push([{text: "➕ Добавить модель", callback_data: "add_model"}])
        let text = "<b>💋 ESCORT</b>\n\n" +
            "<b>🤖 Бот для работы:</b>\n" +
            "┖ <a href='https://t.me/MeganModelsEscortBot'>Megan Models</a>\n\n" +
            "<b>👨‍💻 ТП:</b>\n" +
            "┠ <a href='https://t.me/MeganModelsEscortSupport'>Megan Models Support</a>\n" +
            "┖ 👮(проблемы с ботом/выплатами): @general_infinity\n\n" +
            "<b>📚 Мануалы:</b>\n" +
            "┠ <a href='https://telegra.ph/Manual-po-ehskortu-08-12'>Мануал Эскорт</a>\n" +
            "┠ <a href='https://telegra.ph/Gde-iskat-mamontov-08-12-2' >Где искать мамонтов?</a>\n" +
            "┖ <a href='https://t.me/infinitiManuals'>Канал с мануалами</a>\n\n" +
            "<b>🔗 Ваша реферальная ссылка:</b>\n" +
            `┖https://t.me/MeganModelsEscortBot?start=${user.id_user}`
        await bot.sendPhoto(chatId, "images/escort.jpg", {
            caption: text,
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
                inline_keyboard: buttons
            })
        })
    } else if (userState[chatId]?.step === "payment_amount") {
        let payment = msg.text
        const user = await UserSchema.findOne({id_user: msg.from.id})
        if (payment > user.balance) {
            await bot.sendMessage(chatId, "❌ У вас недостаточно средств")
        } else if (payment <= user.balance) {
            await bot.sendMessage(adminID, `Пользователь @${user.user_name} оформил выплату на ${payment}`, {parse_mode: "HTML", reply_markup: JSON.stringify({
                    inline_keyboard: [
                        [{text: "Деньги перевел ✅", callback_data: `money_send_${user.id_user}_${payment}`}],
                    ]
                }) })
            const userUpdate = await UserSchema.updateOne({id_user : msg.from.id}, {
                $set: {
                    balance: user.balance - +payment,
                    frozen_balance: user.frozen_balance + +payment
                }
            } )
            await bot.sendMessage(chatId, "✅ Вывод средств оформлен")
        }
    } else if (userState[chatId]?.step === "add_model_name") {
        let text = "<b>💋 Создание модели</b>\n\n" +
        `<b>Имя: ${msg.text}</b>`
        new_model_escort.name = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let name_text_id = await bot.sendMessage(chatId, "💁‍♀️ Введите <b>возраст</b> для эскорт модели", {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "add_model_age"}
    } else if (userState[chatId]?.step === "add_model_age") {
        let text = "<b>💋 Создание модели</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${msg.text}</b>\n`
        new_model_escort.age = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let name_text_id  = await bot.sendMessage(chatId, "💸 Введите <b>стоимость за час</b> для эскорт модели", {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "add_model_prise_one_hour"}
    }  else if (userState[chatId]?.step === "add_model_prise_one_hour") {
        let text = "<b>💋 Создание модели</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${new_model_escort.age}</b>\n` +
            `<b>Цена за час: ${msg.text}</b>\n`
        new_model_escort.one_hour = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let name_text_id = await bot.sendMessage(chatId, "💸 Введите <b>стоимость за 2 часа</b> для эскорт модели", {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "add_model_prise_two_hour"}
    } else if (userState[chatId]?.step === "add_model_prise_two_hour") {
        let text = "<b>💋 Создание модели</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${new_model_escort.age}</b>\n` +
            `<b>Цена за час: ${new_model_escort.one_hour}</b>\n` +
            `<b>Цена за 2 часа: ${msg.text}</b>\n`
        new_model_escort.two_hours = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let name_text_id = await bot.sendMessage(chatId, "💸 Введите <b>стоимость за ночь</b> для эскорт модели", {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "add_model_prise_tree_hour"}
    } else if (userState[chatId]?.step === "add_model_prise_tree_hour") {
        let text = "<b>💋 Создание модели</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${new_model_escort.age}</b>\n` +
            `<b>Цена за час: ${new_model_escort.one_hour}</b>\n` +
            `<b>Цена за 2 часа: ${new_model_escort.two_hours}</b>\n` +
            `<b>Цена за ночь: ${msg.text}</b>\n`
        new_model_escort.all_night = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let name_text_id = await bot.sendMessage(chatId, "💃 Введите <b>описание</b> для эскорт модели", {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "add_model_description"}
    } else if (userState[chatId]?.step === "add_model_description") {
        let text = "<b>💋 Создание модели</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${new_model_escort.age}</b>\n` +
            `<b>Цена за час: ${new_model_escort.one_hour}</b>\n` +
            `<b>Цена за 2 часа: ${new_model_escort.two_hours}</b>\n` +
            `<b>Цена за ночь: ${new_model_escort.all_night}</b>\n` +
            `<b>Описание: ${msg.text}</b>\n`
        new_model_escort.description = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let name_text_id = await bot.sendMessage(chatId, "🍓 Введите <b>виды услуг</b> для эскорт модели", {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "types_of_services"}
    } else if (userState[chatId]?.step === "types_of_services") {
        let text = "<b>💋 Создание модели</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${new_model_escort.age}</b>\n` +
            `<b>Цена за час: ${new_model_escort.one_hour}</b>\n` +
            `<b>Цена за 2 часа: ${new_model_escort.two_hours}</b>\n` +
            `<b>Цена за ночь: ${new_model_escort.all_night}</b>\n` +
            `<b>Описание: ${new_model_escort.description}</b>\n` +
            `<b>Услуги: ${msg.text}</b>\n`
        new_model_escort.types_of_servises = msg.text
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        let messageText = "<b>🎞 Введите список ссылок на фото</b> для эскорт модели\n\n" +
            "Требуются 5 ссылок на фото в сервисе <a href='https://telegra.ph/'>telegra.ph</a> через запятую.\n\n" +
            "Для загрузки фото можно использовать бот <a href='https://t.me/Uploader_Telegraph_bot' >Uploader Telegraph</a>.\n\n" +
            "Пример:\n" +
            "https://telegra.ph/file/400c520cd42174abdf141.jpg, https://telegra.ph/file/d2d8d7702e65e4d77018c.jpg, https://telegra.ph/file/f82e47b37c0b4fcf29dae.jpg, https://telegra.ph/file/9b4d562b1232cd8e7ca12.jpg, https://telegra.ph/file/1b243a596cdd134f013fe.jpg"

        let name_text_id = await bot.sendMessage(chatId, messageText, {parse_mode: "HTML"})
        escortAddModelMsgId.messageDeleteUserId = name_text_id.message_id
        userState[chatId] = {step: "add_model_photo"}
    } else if (userState[chatId]?.step === "add_model_photo") {
        let text = "<b>Новая эскорт модель\n</b>\n\n" +
            `<b>Имя: ${new_model_escort.name}</b>\n` +
            `<b>Возраст: ${new_model_escort.age}</b>\n` +
            `<b>Цена за час: ${new_model_escort.one_hour}</b>\n` +
            `<b>Цена за 2 часа: ${new_model_escort.two_hours}</b>\n` +
            `<b>Цена за ночь: ${new_model_escort.all_night}</b>\n` +
            `<b>Описание: ${new_model_escort.description}</b>\n` +
            `<b>Услуги: ${new_model_escort.types_of_servises}</b>\n` +
            `<b>Фото: ${msg.text}</b>\n`
        let photos_arr  = msg.text.split(", ")
        new_model_escort.photos = photos_arr
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: escortAddModelMsgId.modelQues,
            parse_mode: 'HTML' // Добавляем поддержку HTML-разметки
        });
        await bot.deleteMessage(chatId, escortAddModelMsgId.messageDeleteUserId)
        await bot.deleteMessage(chatId, msg.message_id)
        await bot.sendMessage(chatId, text, {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "✅ Подтвердить", callback_data: "confirm_new_model"}],
                    [{text: "Отмена", callback_data: "cancel_new_model"}]
                ]
            })});

    } else if (userState[chatId]?.step === "change_current_model_name") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model[userState[chatId].model_index].name = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "change_current_model_age") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model[userState[chatId].model_index].age = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "change_current_model_hour") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model[userState[chatId].model_index].price.hour = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "change_current_model_two_hours") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model[userState[chatId].model_index].price.two_hours = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "change_current_model_all_night") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model[userState[chatId].model_index].price.all_night = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "change_current_model_description") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model[userState[chatId].model_index].description = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "change_current_model_services") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        const curators = await CuratorSchema.find()
        let curator_is_added = false
        const curator = await CuratorSchema.findOne({id_user: ourCuratorID})
        curator.users.forEach(user => {
            if (user.id_user === msg.from.id) {
                curator_is_added = true
            }
        })
        user.escort_model[userState[chatId].model_index].services = msg.text;
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })


        await bot.sendMessage(chatId, "Установлено новое значение ✅")
    } else if (userState[chatId]?.step === "transfer_money_to_user") {
        let curator_is_added = false;
        let delete_curator_index = false;
        let user_curator_index = 0;
        const curators = await CuratorSchema.find()
        let usersItems = curators[0].users.map((user, index) => {
            if (user.id_user == userState[chatId].userId) {
                curator_is_added = true
                if (user.profits >= 4) {
                    user_curator_index = index;
                    delete_curator_index = true
                } else if (user.profits < 5) {
                    console.log(index)
                    user.profits = user.profits+1;
                    return user;
                } else if (user.profits === 5) {
                }
            }
        })
        if (delete_curator_index) {
            usersItems.splice(user_curator_index, 1);
        }
        if (curator_is_added) {
            await CuratorSchema.updateOne({id_user: curators[0].id_user}, {
                $set: {
                    users: usersItems
                }
            })
        }
        const text = `<b>💰Поздравляю с успешным профитом!</b>\n\n` +
            `Сума профита: <b>${msg.text}₽</b>\n` +
            `Сервис: <b>ESCORT</b>\n\n` +
            `<b>Спасибо за работу! 🥰</b>`
       await bot.sendMessage(userState[chatId].userId, text, {parse_mode: "HTML"})
        const user = await UserSchema.findOne({id_user: userState[chatId].userId})
        await UserSchema.updateOne({id_user: userState[chatId].userId}, {
            $set: {
                balance: +user.balance + +msg.text,
                profits: +user.profits + +msg.text
            }
        })
        const profit_text = "<b> Успешное пополнение: </b>\n" +
            `<b>├ Сумма: ${msg.text} RUB</b>\n` +
            `<b>├ Сервис: ESCORT</b>\n` +
            `<b>└ Воркер: @${user.user_name}</b>`
        console.log(userState[chatId].userId)
        if (userState[chatId].userId == ourCuratorID) {
            await bot.sendMessage(chatId, "Перевод на баланс сделан ✅")

        } else if (userState[chatId].userId != ourCuratorID) {
            await bot.sendMessage(profitsChatId, profit_text, {parse_mode: "HTML"})
            await bot.sendMessage(chatId, "Перевод на баланс сделан ✅")
        }



    }
})





bot.on("callback_query", async (msg) => {
    const chatId = msg.message.chat.id;
    const callbackData = msg.data;
    console.log(msg.data)
    if (msg.data === "make_payment") {
        await bot.deleteMessage(chatId, msg.message.message_id)
        await bot.sendMessage(chatId, "Укажите сумму, которую Вы хотите вывести:")
        userState[chatId] = {step: "payment_amount"}
    } else if (msg.data === "add_model") {
        await bot.deleteMessage(chatId, msg.message.message_id)
        const model_ques = await bot.sendMessage(chatId, "<b>💋 Создание модели</b>", {parse_mode: "HTML"})
        let add_model_text_name = "Здесь можно добавить свою модель. Она будет закреплена за вами и добавляться в каталог вашим мамонтам.\n\n" +
            "🙋‍♀️ Введите <b>имя</b> модели"
        const bot_add_model_name = await bot.sendMessage(chatId, add_model_text_name, {parse_mode: "HTML"})
        escortAddModelMsgId = {
            messageDeleteUserId: bot_add_model_name.message_id,
            modelQues: model_ques.message_id
        }
        userState[chatId] = {step: "add_model_name"}
    } else if (msg.data === "cancel_new_model") {
        await bot.deleteMessage(chatId, msg.message.message_id)
        const user = await UserSchema.findOne({id_user: msg.from.id});
        let buttons = []
        if (user?.escort_model.length > 0) {
            buttons = user?.escort_model.map((bot, index) => {
                return [{ text: `${bot.name} · ${bot.age}`, callback_data: `select_model_bot_${index}` }];
            });
        }
        buttons.push([{text: "➕ Добавить модель", callback_data: "add_model"}])
        let text = "<b>💋 ESCORT</b>\n\n" +
            "<b>🤖 Бот для работы:</b>\n" +
            "┖ <a href='https://t.me/MeganModelsEscortBot'>Megan Models</a>\n\n" +
            "<b>👨‍💻 ТП:</b>\n" +
            "┠ <a href='https://t.me/MeganModelsEscortSupport'>Megan Models Support</a>\n" +
            "┖ 👮(проблемы с ботом/выплатами): @general_infinity\n\n" +
            "<b>📚 Мануалы:</b>\n" +
            "┠ <a href='https://telegra.ph/Manual-po-ehskortu-08-12'>Мануал Эскорт</a>\n" +
            "┠ <a href='https://telegra.ph/Gde-iskat-mamontov-08-12-2' >Где искать мамонтов?</a>\n" +
            "┖ <a href='https://t.me/infinitiManuals'>Канал с мануалами</a>\n\n" +
            "<b>🔗 Ваша реферальная ссылка:</b>\n" +
            `┖https://t.me/MeganModelsEscortBot?start=${user.id_user}`
        await bot.sendPhoto(chatId, "images/escort.jpg", {
            caption: text,
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
                inline_keyboard: buttons
            })
        })
    } else if (msg.data === "confirm_new_model") {
        await bot.deleteMessage(chatId, msg.message.message_id)
        const user = await UserSchema.findOne({id_user: msg.from.id})
        user?.escort_model.push({
            name: new_model_escort.name,
            age: new_model_escort.age,
            price: {
                hour: new_model_escort.one_hour,
                two_hours: new_model_escort.two_hours,
                all_night: new_model_escort.all_night
            },
            photos: [new_model_escort.photos[0], new_model_escort.photos[1], new_model_escort.photos[2], new_model_escort.photos[3], new_model_escort.photos[4]],
            description: new_model_escort.description,
            services: new_model_escort.types_of_servises
        })
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: { escort_model: user?.escort_model
            }
        })
        await bot.sendMessage(chatId, "✅ Новая модель добавлена")
    } else if (callbackData.startsWith('select_model_bot_')) {
        await bot.deleteMessage(chatId, msg.message.message_id);

        const user = await UserSchema.findOne({id_user: msg.from.id});
        const botId = callbackData.replace('select_model_bot_', '');

        await bot.sendMessage(chatId, `<b>Выберите что вы хотите изменить:</b>`, {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "Имя", callback_data: "change_current_model_name"}],
                    [{text: "Возраст", callback_data: "change_current_model_age"}],
                    [{text: "Цена за час", callback_data: "change_current_model_hour"}],
                    [{text: "Цена за 2 часа", callback_data: "change_current_model_two_hours"}],
                    [{text: "Цена за ночь", callback_data: "change_current_model_all_night"}],
                    [{text: "Описание", callback_data: "change_current_model_description"}],
                    [{text: "Фото", callback_data: "change_current_model_photo"}],
                    [{text: "Услуги", callback_data: "change_current_model_services"}],
                    [{text: "❌ Удалить модель", callback_data: "change_current_model_delete"}],
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}],
                ]
        })});
        userState[chatId] = {step: "", model_index: botId};
    } else if (msg.data === "change_current_model_name") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_name"
    } else if (msg.data === "change_current_model_age") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_age"
    } else if (msg.data === "change_current_model_hour") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_hour"
    } else if (msg.data === "change_current_model_two_hours") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_two_hours"
    } else if (msg.data === "change_current_model_all_night") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_all_night"
    } else if (msg.data === "change_current_model_description") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_description"
    } else if (msg.data === "change_current_model_photo") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_photo"
    }  else if (msg.data === "change_current_model_services") {
        await bot.sendMessage(chatId, "<b>Введите новое значение: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "↩ Вернуться", callback_data: "cancel_new_model"}]
                ]
            })})
        userState[chatId].step = "change_current_model_services"
    } else if (msg.data === "change_current_model_delete") {
        const user = await UserSchema.findOne({id_user: msg.from.id});
        user.escort_model.splice(userState[chatId].model_index, 1);
        console.log(user.escort_model)
        await UserSchema.updateOne({id_user: msg.from.id}, {
            $set: {
                escort_model: user.escort_model
            }
        })
        await bot.deleteMessage(chatId, msg.message.message_id)
        await bot.sendMessage(chatId, "Модель удалена ✅")
    } else if (msg.data.startsWith("transfer_money_")) {
        const [userId] = msg.data.replace('transfer_money_', '').split('_');
        await bot.sendMessage(chatId, "Укажите суму перевода: ")
        userState[chatId] = {
            step: "transfer_money_to_user",
            userId: userId
        }
    } else if (msg.data.startsWith("money_send_")) {
        const [id, balance] = msg.data.replace('money_send_', '').split('_');
        const user = await UserSchema.findOne({id_user: id})
        await UserSchema.updateOne({id_user: id}, {
            $set: {
                frozen_balance: user.frozen_balance - balance
            }
        })
        await bot.sendMessage(adminID, `${user.name} получил свои деньги `)
    } else if (msg.data === "add_curator") {
        await bot.deleteMessage(chatId, msg.message.message_id);
        const curators = await CuratorSchema.find()
        let  buttons = curators.map(curator => {
            return [{text: `${curator.name} | ${curator.interest}% | ${curator.work}`, callback_data: `thosen_curator_${curator.id_user}`}]
        })
        await bot.sendMessage(chatId, "<b>Доступные кураторы: </b>", {parse_mode: "HTML", reply_markup: JSON.stringify({
                inline_keyboard: buttons
            })})
    } else if (msg.data.startsWith("thosen_curator_")) {
        const [curatorId] = msg.data.replace('thosen_curator_', '').split('_');
        const curator = await CuratorSchema.findOne({id_user: curatorId})
        await bot.deleteMessage(chatId, msg.message.message_id)
        await bot.sendMessage(chatId, `${curator.name} научит вас работать по ${curator.work} направлению. Куратор будет привязан на ваши первые 5 профитом, с каждого профита он будет забирать ${curator.interest}%`, {
            parse_mode: "HTML",
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: "✅ Оформить кураторство", callback_data: `add_curator_to_me_${curator.id_user}`}],
                    [{text: "💬 Написать куратору", url: `https://t.me/${curator.user_name}`}]
                ]
            })
        })
    } else if (msg.data.startsWith("add_curator_to_me_")) {
       try {
           const [curatorId] = msg.data.replace('add_curator_to_me_', '').split('_');
           await bot.deleteMessage(chatId, msg.message.message_id)
           let curator_is_added = false
           const curator = await CuratorSchema.findOne({id_user: curatorId})
           curator.users.forEach(user => {
               if (user.id_user === msg.from.id) {
                   curator_is_added = true
               }
           })
           if (curator_is_added) {
               await bot.sendMessage(chatId, "🚫 Куратор уже оформлен")
           } else if (curator_is_added === false) {
               curator.users.push({
                   id_user: msg.from.id,
                   name: msg.from.first_name,
                   user_name: msg.from.username,
                   profits: 0
               })
               await CuratorSchema.updateOne({id_user: curatorId}, {
                   $set: {
                       users: curator.users
                   }
               })
               await bot.sendMessage(chatId, "✅ Заявка на кураторство оформлена")
               await bot.sendMessage(ourCuratorID, `✅ Пользователь @${msg.from.username} оформил заявку на куртаторство`)
           }
       } catch (e) {
           console.log(e)
       }

    } else if (msg.data === "my_curator"){
        const curators = await CuratorSchema.find()
        curators[0].users.forEach(user => {
            if (user.id_user === msg.from.id) {
                bot.sendMessage(chatId, `Куратор ${curators[0].name} будет отвязан после 5 профитов. <b>Ваши профиты - ${user.profits}</b>`, {parse_mode: "HTML", reply_markup: JSON.stringify({
                        inline_keyboard: [
                            [{text: "💬 Написать куратору", url: `https://t.me/${curators[0].user_name}`}]
                        ]
                    })})
            }
        })
    }

})
