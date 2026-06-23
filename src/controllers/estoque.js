const prisma = require('../config/prisma');


async function estoque(req, res){
    try{
        const produtos = await prisma.produto.findMany();
        const estoqueTotal = produtos.map(produto => {
            let status;
            if (produto.quantidade_estoque < produto.minimo){
                status = 'Estoque abaixo do nível mínimo';
            } else {
            status = 'OK';
            }
        return {
            id: produto.id,
            nomo: produto.nome,
            quantidade_estoque: produto.quantidade_estoque,
            minimo: produto.minimo,
            status: status
        };
        });
        res.json(estoqueTotal);
    } catch (error){
        res.status(500).json({erro:error.message});
    }
}