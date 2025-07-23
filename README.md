# FastifyPostgres

A very simple Fastify API to search insurance policies by customer first or last name.

## Features

- Search customers by first and/or last name
- Returns grouped policy data per customer
- Handles empty queries with proper error responses

## Endpoints

### GET /search

Query parameters:
- `first_name`
- `last_name`

Both are optional, so you can search for one or the other. 
Returns policies matching either name. At least one query parameter is required.
