import TelegramBot from "node-telegram-bot-api";

class BotController {
    bot: TelegramBot

    constructor(bot: TelegramBot) {
        this.bot = bot
    }

    public async onMessage(chatId: number, msg: any) {
        console.log('onMessage', msg)
    }

    // public async onEvent(eventName: string, msg: any) {
    //     console.log(eventName, msg)
    //     switch (eventName) {
    //         case 'text':
    //             this.messageControl(msg)
    //     }
    // }
    //
    //
    //
    // private messageControl(msg: any): void {
    //     // react on text message
    //     console.log('messageControl', msg)
    // }


}

export default BotController;