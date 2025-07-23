import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyPostgres from '@fastify/postgres';

const fastify = Fastify();

interface QueryContent {
  first_name?: string;
  last_name?: string;
}

fastify.register(fastifyPostgres, {
  connectionString: 'ommited'
});

fastify.get('/search', async (
  req: FastifyRequest<{ Querystring: QueryContent }>,
  reply: FastifyReply
) => {
  const { first_name, last_name } = req.query;

  if (first_name == null && last_name == null) {
    return reply.status(400).send({ error: "Query was empty" });
  }

  try {
    const { rows } = await fastify.pg.query(
      `
      SELECT
        c.first_name, 
        c.last_name,
        p.policyid,
        p.contract_length,
        p.premium_amount,
        p.policy_type
      FROM policies p
      JOIN customers c ON p.customerid = c.customerid
      WHERE c.first_name ILIKE $1 OR c.last_name ILIKE $2
      ORDER BY
        (first_name = $1) DESC,
        (last_name = $2) DESC,
        first_name,
        last_name;
      `,
      [req.query.first_name, req.query.last_name]
    );

    if (!rows.length) {
      return reply.send({ message: "No results found" });
    }

    const grouped = rows.reduce((acc: any, item: any) => {
      const name = `${item.first_name} ${item.last_name}`;
      if (!acc[name]) acc[name] = [];
      acc[name].push({
        policy_type: item.policy_type,
        policyid: item.policyid,
        contract_length: item.contract_length,
        premium_amount: item.premium_amount
      });
      return acc;
    }, {});

    reply.send(grouped);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: "Database error" });
  }
});

async function start() {
  console.log('Starting server...');  // add this line
  try {
    const address = await fastify.listen({ port: 3000 });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}


start();