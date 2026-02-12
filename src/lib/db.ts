import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'mtruyen',
    password: process.env.DB_PASSWORD || 'mtruyenpassword',
    database: process.env.DB_NAME || 'mtruyen_ranking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function query<T>(sql: string, params: any[] = []): Promise<T> {
    const [results] = await pool.execute(sql, params);
    return results as T;
}

export default pool;
