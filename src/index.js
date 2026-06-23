const express = require('express');
 
const app = express();
 app.use(express.json());

app.get('/', (req, res) => {
res.json({ mensagem: 'Servidor funcionando!' });
});
 


const ingredientes = [
{ id: 1, nome: 'Batata', quantidade_estoque: 25, minimo: 10, data_cadastro:"2026-06-12T10:56:22.123Z" },
{ id: 2, nome: 'Carne Moída', quantidade_estoque: 35, minimo: 9, data_cadastro:"2026-06-12T10:56:25.233Z" },
];
 
app.get('/ingredientes', (req, res) => {
res.json(ingredientes);
});

app.get('/ingredientes/:id', (req, res) => {
const id = Number(req.params.id);
const produto = ingredientes.find(p => p.id === id);
 
if (!produto) {
return res.status(404).json({ erro: 'Ingrediente não encontrado' });
}
 
res.json(produto);
});





app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
