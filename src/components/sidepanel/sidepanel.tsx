// Import dependencies
import React from 'react';

import 'mdui';
import 'mdui/mdui.css';
import '@components/sidepanel/sidepanel.css';
import { getAnswerFromLLM, LLMResponse } from '@lib/helper';


function downloadResponse(content: string, fileName: string = 'json.txt', contentType: string = 'text/plain') {
    let a = document.createElement('a');
    let file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

const Sidepanel: React.FC = () => {
    const [chats, setChats] = React.useState<LLMResponse[] | never[]>([]);
    const [input, setInput] = React.useState('');

    // Create a new chat card
    const ChatCard = (props: { url: string }) => {
        const [status, setStatus] = React.useState('idle');
        const [res, setRes] = React.useState<LLMResponse>();

        getAnswerFromLLM(props.url).then((res) =>
          setRes(res),
        );

        return (
          <mdui-card variant="filled" clickable>
              <div className={'w-full p-4'}>
                  <div>
                      <h2 className={'typo-headline-medium text-left text-on-surface'}>{res?.response.summary}</h2>
                      <body
                        className={'my-1 typo-body-large text-left text-on-surface-variant'}>{res?.metadata.ogUrl}</body>
                  </div>
              </div>
          </mdui-card>
        );
    };

    // Create a wrapper for all chat cards
    const ChatsWrapper = () => {
        return (
          <div className={'flex flex-col gap-4'}>
              {chats.map((res, index) => (
                <ChatCard key={index} url={input} />
              ))}
          </div>
        );
    };

    // If no chats, show welcome message
    const WelcomeMsg = () => {
        return (
          <div className={'text-left text-display-large font-display-large' +
            ' text-on-surface leading-display-large' +
            ' tracking-display-large'}>
              <p>Hi! I'm Clara, your personal assistant.</p>
              <p className={'font-normal text-on-surface-variant' +
                ' text-display-medium leading-display-medium' +
                ' tracking-display-medium'}>How can I
                  help you today.</p>
          </div>
        );
    };

    // Send a chat message to the chat list
    const sendChat = async (input: string) => {
        if (input != '') {
            setInput('');

            const response = await getAnswerFromLLM(input)
              .then((res) => setChats([...chats, res]));
        } else {
            alert('Please enter a valid URL');
        }
    };

    return (
      <mdui-layout full-height={true} className={'font-medium'}>
          <mdui-top-app-bar>
              <mdui-button-icon icon="menu"></mdui-button-icon>
              <mdui-top-app-bar-title className="font-semibold">Clara
              </mdui-top-app-bar-title>
              <mdui-button-icon icon="tune"></mdui-button-icon>
          </mdui-top-app-bar>

          <mdui-layout-main>
              <div className={'p-4'}>
                  {chats.length === 0 ? <WelcomeMsg /> : <ChatsWrapper />}
              </div>
          </mdui-layout-main>

          <mdui-bottom-app-bar fab-detach scroll-behavior="hide"
                               scroll-threshold={10}>
              <input type={'text'}
                     placeholder={'Type an URL here...'}
                     className={'flex-auto text-body-large text-on-surface-variant'}
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
              />
              <div className={'flex-grow'}></div>
              <mdui-fab icon="send" onClick={() => sendChat(input)}></mdui-fab>
          </mdui-bottom-app-bar>

          <div className="chats-anchor">
              <div className="cards-container"></div>
          </div>
      </mdui-layout>
    );
};

export default Sidepanel;
