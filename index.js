'use strict';
//モジュール呼び出し
const line = require('@line/bot-sdk');
const crypto = require('crypto');

//インスタンス生成
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = (event, context) => {

    //署名検証
    let signature = crypto.createHmac('sha256', process.env.CHANNELSECRET).update(event.body).digest('base64');
    let checkHeader = (event.headers || {})['X-Line-Signature'];
    if(!checkHeader){
        checkHeader = (event.headers || {})['x-line-signature'];
    }
    let body = JSON.parse(event.body);
    const events = body.events;
    console.log(events);

    //署名検証が成功した場合
    if (signature === checkHeader) {
        events.forEach(async (event) => {

            let message;
            //イベントタイプごとに関数を分ける
            switch (event.type) {
                //メッセージイベント
                case "message":
                    message = messageFunc(event);
                    break;
            }

            //メッセージを返信
            if (message != undefined) {
                client.replyMessage(body.events[0].replyToken, message)
                    .then((response) => {
                        let lambdaResponse = {
                            statusCode: 200,
                            headers: { "X-Line-Status": "OK" },
                            body: '{"result":"completed"}'
                        };
                        context.succeed(lambdaResponse);
                    }).catch((err) => console.log(err));
            }
        });
    }

    //署名検証に失敗した場合
    else {
        console.log('署名認証エラー');
    }
};

const messageFunc = (e) => {

    //テキストではないメッセージ（画像や動画など）が送られてきた場合はコンソールに「テキストではないメッセージが送られてきました」と出力する
    if (e.message.type != "text") {
        console.log("テキストではないメッセージが送られてきました");
        return;
    }

    message = {
        type: "text",
        text: e.message.text
    };

    console.log(`メッセージ：${userMessage}`);
    return message;
};
