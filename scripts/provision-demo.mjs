import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";

try {
  loadEnvFile(".env.local");
} catch {
  // Variáveis também podem ser fornecidas diretamente pelo ambiente.
}

const required = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY", "DEMO_USER_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Variável obrigatória ausente: ${key}`);
}

const email = process.env.DEMO_USER_EMAIL || "climba@example.com";
const username = process.env.DEMO_USERNAME || "Climba";
const password = process.env.DEMO_USER_PASSWORD;
const url = process.env.SUPABASE_URL;
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: usersData, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
let user = usersData.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: username },
  });
  if (error) throw error;
  user = data.user;
}

const app = createClient(url, process.env.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const { error: signInError } = await app.auth.signInWithPassword({ email, password });
if (signInError) throw signInError;

const categorySeeds = [
  ["Informática", "Periféricos, acessórios e equipamentos"],
  ["Escritório", "Materiais para a rotina administrativa"],
  ["Limpeza", "Higiene e conservação dos ambientes"],
  ["Manutenção", "Ferramentas e peças de reposição"],
];

for (const [name, description] of categorySeeds) {
  const existing = await app.from("categories").select("id").ilike("name", name).maybeSingle();
  if (existing.error) throw existing.error;
  if (!existing.data) {
    const inserted = await app.from("categories").insert({ name, description });
    if (inserted.error) throw inserted.error;
  }
}

const categories = await app.from("categories").select("id, name");
if (categories.error) throw categories.error;
const categoryId = Object.fromEntries(categories.data.map((category) => [category.name, category.id]));
const products = [
  ["Mouse sem fio", "Informática", "Mouse ergonômico 2.4 GHz", 89.9, 12, 5],
  ["Teclado USB", "Informática", "Teclado ABNT2 de perfil baixo", 129.9, 4, 5],
  ["Monitor 24 polegadas", "Informática", "Painel IPS Full HD", 899, 0, 2],
  ["Cabo HDMI", "Manutenção", "Cabo HDMI 2.0 de 2 metros", 39.9, 8, 4],
  ["Papel A4", "Escritório", "Resma com 500 folhas", 32.5, 3, 8],
];

for (const [name, category, description, price, initialStock, minimumStock] of products) {
  const existing = await app.from("products").select("id").eq("name", name).maybeSingle();
  if (existing.error) throw existing.error;
  if (!existing.data) {
    const created = await app.rpc("create_product_with_initial_stock", {
      p_category_id: categoryId[category],
      p_name: name,
      p_description: description,
      p_price: price,
      p_initial_stock: initialStock,
      p_minimum_stock: minimumStock,
    });
    if (created.error) throw created.error;
  }
}

await app.auth.signOut();
console.log(`Usuário demonstrativo provisionado: ${username} (${user.id})`);
