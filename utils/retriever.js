import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';


const supaBaseApiKey = process.env.SUPABASE_API_KEY;
const supaBaseUrl = process.env.SUPABASE_URL;
const openAiApiKey = process.env.OPENAI_API_KEY;
const client = createClient(supaBaseUrl, supaBaseApiKey);

const embeddings = new OpenAIEmbeddings({openAiApiKey});

const vectorStore = new SupabaseVectorStore(embeddings, {
	client,
	tableName: 'documents',		//all of this is config
	queryName: 'match_documents'
});

const retriever = vectorStore.asRetriever();

export {retriever};
