const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const SENHA_INICIAL = process.env.SEED_PASSWORD || 'Alterar@123';

const gestores = [
  { email: 'fredmazzo@gmail.com', nome: 'Frederico Mazzo' },
  { email: 'contato@imobmiq.com.br', nome: 'Alexsandro Mantovani' },
];

const corretores = [
  { email: 'corretor@imobmiq.com.br', nome: 'Corretor Teste' },
];

async function main() {
  const senhaHash = await bcrypt.hash(SENHA_INICIAL, 10);
  for (const g of gestores) {
    await prisma.usuario.upsert({
      where: { email: g.email },
      update: {},
      create: {
        email: g.email,
        nome: g.nome,
        senhaHash,
        role: 'gestor',
        ativo: true,
      },
    });
    console.log('Gestor criado/atualizado:', g.email);
  }
  for (const c of corretores) {
    await prisma.usuario.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        nome: c.nome,
        senhaHash,
        role: 'corretor',
        ativo: true,
      },
    });
    console.log('Corretor criado/atualizado:', c.email);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
