import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'activity_feed'`;
console.log('activity_feed columns:', columns.map(r => r.column_name).join(', '));

const tasks = await sql`SELECT count(*) FROM tasks`;
console.log('Tasks count:', tasks[0].count);

const activities = await sql`SELECT count(*) FROM activity_feed`;
console.log('Activities count:', activities[0].count);

const sample = await sql`SELECT * FROM activity_feed LIMIT 1`;
console.log('Sample activity:', JSON.stringify(sample[0], null, 2));

await sql.end();

