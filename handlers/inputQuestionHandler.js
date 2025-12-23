import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

import { retriever } from '../utils/retriever.js';
import { combineDocuments } from '../utils/combineDocuments.js';


const inputQuestionHandler = async (req, res) => {

        
    const openAiApiKey = process.env.OPENAI_API_KEY;

    const llm = new ChatOpenAI({openAiApiKey});

    //const standaloneQuestionTemplate = 'Generate a standalone question from the following input : {inputQuestion}';
    const standaloneQuestionTemplate = 'Given a question, convert it to a standalone question. question: {inputQuestion} standalone question:'
    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(standaloneQuestionTemplate);
    const standaloneQuestionChain = RunnableSequence.from([
        standaloneQuestionPrompt,
        llm,
        new StringOutputParser()
    ]);

    const retrieverChain = RunnableSequence.from([
        prevResult => prevResult.standaloneQuestion,
        retriever,
        combineDocuments
    ]);

    const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given question about Toro Supplements Store based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the questioner to email help@toro-supplements.com. Don't try to make up an answer. Always speak as if you were chatting to a friend.
    context: {context}
    question: {inputQuestion}
    answer: `;
    const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);
    const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

    //const chain = standaloneQuestionChain.pipe(retriever).pipe(combineDocuments).pipe(answerPrompt);
    const chain = RunnableSequence.from([
        {
            standaloneQuestion: standaloneQuestionChain,
            original_input: new RunnablePassthrough()
        },
        {
            context: retrieverChain,
            inputQuestion: ( {original_input} ) => original_input.inputQuestion

        },
        answerChain
    ]);

    const result = await chain.invoke({
        inputQuestion : req.body.input, 
    });

    res.json(result);
}

export default inputQuestionHandler;