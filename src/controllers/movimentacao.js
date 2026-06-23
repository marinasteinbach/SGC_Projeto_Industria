const prisma = require('../config/prisma');

async function consumoProduto (req,res){
    const{produto_id, quantidade, usuario_id} = req.body;

    if(!produto_id || !quantidade || !usuario_id){
        return res.status(400).json({
            erro: 'Dados incompletos',
            campos_obrigatorios: ['produto_id', 'quantidade','usuario_id']
        });
    }

    if (quantidade <= 0){
        return res.status(400).json({
            erro: 'A quantidade deve ser maior que zero'
        });
    }
    try{
        const produto = await prisma.produto.findUnique({
            where: {id: Number(produto_id)}
        });
        if(!produto){
            return res.status(404).json({
                erro: 'Produto não encontrado'
            });
        }
    
    if (produto.quantidade_estoque < quantidade){
        return res.status(400).json({
            erro: 'Não há quantidade suficiente no estoque',
            produto: produto.nome,
            disponivel: produto.quantidade_estoque,
            solicitado: quantidade,
            falta: quantidade - produto.quantidade_estoque
        });
    }
    const resultado = await prisma.$transaction(async (tx) =>{
        const produtoAtualizado = await tx.produto.update({
            where:{id: Number(produto_id)},
            data: {
                quantidade_estoque: {
                    decrement: quantidade
                }
            }
        });
        await tx.movimentacao.create({
            data: {
                tipo: 'BAIXA',
                quantidade: quantidade,
                produto_id: Number(produto_id),
                usuario_id: Number(usuario_id)
            }
        });
        return produtoAtualizado;
    });
        res.json({
            mensagem: 'Baixa registrada',
            dados: {
                produto: resultado.nome,
                quantidade_retirada: quantidade,
                estoque_restante: resultado.quantidade_estoque,
                minimo: resultado.minimo,
                status: resultado.quantidade_estoque < resultado.minimo
                ? 'A quantidade em estoque é baixa'
                : 'OK'
            }
        });

    } catch (error){
        console.error('Erro ao dar baixa:', error);
        res.status(500).json({
            erro: 'Erro ao dar baixa',
            detalhe:error.messagr
        });
    }
}

module.exports = {
    BaixaProduto
};