import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { readFileSync } from 'fs';

try {

    const kb = [ 
        '../toro_supplements_knowledge_base/guides/beginner_plan.txt',
        '../toro_supplements_knowledge_base/guides/how_to_choose_protein.txt',
        '../toro_supplements_knowledge_base/guides/stacking_supplements.txt',
        '../toro_supplements_knowledge_base/guides/dosage_tips.txt',
        '../toro_supplements_knowledge_base/guides/nutrition_basics.txt',
        '../toro_supplements_knowledge_base/guides/supplement_guide.txt',
        '../toro_supplements_knowledge_base/policies/disclaimer.txt',
        '../toro_supplements_knowledge_base/policies/faq.txt',
        '../toro_supplements_knowledge_base/policies/refund_policy.txt',
        '../toro_supplements_knowledge_base/policies/shipping_policy.txt',
        '../toro_supplements_knowledge_base/products/protein_powders.txt',
        '../toro_supplements_knowledge_base/products/skin_care.txt',
        '../toro_supplements_knowledge_base/products/vitamins.txt',

    ];

    const result = [];
    const res = [];

    kb.forEach((elem) => result.push(readFileSync(elem)));
    result.forEach((elem) => res.push(elem.toString()));

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize : 600,
        separators: ['\n\n', '\n', ' ', '', '##'],
        chunkOverlap: 60
    });

    const output = await splitter.createDocuments(res);
    console.log(output);

    const supaBaseApiKey = process.env.SUPABASE_API_KEY;
    const supaBaseUrl = process.env.SUPABASE_URL;
    const openAiApiKey = process.env.OPENAI_API_KEY;

    const client = createClient(supaBaseUrl, supaBaseApiKey);

    await SupabaseVectorStore.fromDocuments(
        output,
        new OpenAIEmbeddings({ openAiApiKey }),
        {
            client,
            tableName: 'documents',
        }
    );
}catch(err) {
    console.log(err);
}