const express = require('express');
const app = express();
app.use(express.json());

const ingredientes = [
    { id: 1, nome: 'Batata', quantidade: 25, minimo: 10 },
    { id: 2, nome: 'Carne Moída', quantidade: 35, minimo: 9 },
    { id: 3, nome: 'Cebola', quantidade: 15, minimo: 5 },
];

let proximoId = 4;

app.get('/', (req, res) => {
    res.json({
        mensagem: ' Sistema de Estoque - Restaurante',
        
    });
});

app.get('/estoque', (req, res) => {
    const resultado = ingredientes.map(p => ({
        id: p.id,
        nome: p.nome,
        quantidade: p.quantidade,
        minimo: p.minimo,
        status: p.quantidade < p.minimo ? 'Abaixo do nível mínimo' : 'OK',
        alerta: p.quantidade < p.minimo ? `Atenção! ${p.nome} está abaixo do mínimo (${p.minimo})` : null
    }));
    
    res.json({
        total_produtos: ingredientes.length,
        produtos: resultado
    });
});

app.post('/cozinhar', (req, res) => {
    const { id, quantidade } = req.body;

    if (!id || !quantidade) {
        return res.status(400).json({
            erro: 'Dados incompletos',
            exemplo: { id: 1, quantidade: 3 }
        });
    }

    if (quantidade <= 0) {
        return res.status(400).json({ erro: 'Quantidade deve ser maior que zero' });
    }

    const ingrediente = ingredientes.find(p => p.id === id);

    if (!ingrediente) {
        return res.status(404).json({ erro: 'Ingrediente não encontrado' });
    }

    if (ingrediente.quantidade < quantidade) {
        return res.status(400).json({
            erro: 'Ingrediente insuficiente para o cozimento!',
            ingrediente: ingrediente.nome,
            disponivel: ingrediente.quantidade,
            necessario: quantidade,
            falta: quantidade - ingrediente.quantidade
        });
    }

    ingrediente.quantidade -= quantidade;
    const abaixoMinimo = ingrediente.quantidade < ingrediente.minimo;

    const resposta = {
        mensagem: 'Cozimento realizado com sucesso!',
        dados: {
            ingrediente: ingrediente.nome,
            quantidade_usada: quantidade,
            estoque_restante: ingrediente.quantidade,
            minimo: ingrediente.minimo
        }
    };

    if (abaixoMinimo) {
        resposta.status = 'ESTOQUE BAIXO';
        resposta.alerta = `ATENÇÃO! ${ingrediente.nome} está abaixo do mínimo (${ingrediente.minimo})!`;
    } else {
        resposta.status = 'OK';
    }

    res.json(resposta);
});

app.post('/produtos', (req, res) => {
    const { nome, quantidade, minimo } = req.body;

    if (!nome || quantidade === undefined) {
        return res.status(400).json({
            erro: 'Dados incompletos',
            exemplo: { nome: 'Tomate', quantidade: 20, minimo: 5 }
        });
    }

    if (quantidade <= 0) {
        return res.status(400).json({ erro: 'Quantidade deve ser maior que zero' });
    }

    const novoProduto = {
        id: proximoId++,
        nome: nome,
        quantidade: quantidade,
        minimo: minimo || 5
    };

    ingredientes.push(novoProduto);

    res.json({
        mensagem: `${novoProduto.nome} cadastrado com sucesso!`,
        produto: novoProduto,
        total_em_estoque: ingredientes.length
    });
});

app.listen(3000, () => {
    console.log('✅ Servidor rodando em http://localhost:3000');
});