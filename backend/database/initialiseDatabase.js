module.exports = {
  initialiseDatabase: async(client) => {
    await client.query(`DROP TABLE IF EXISTS users`)
    await client.query(`DROP TABLE IF EXISTS sessions`)
    await client.query(`DROP TABLE IF EXISTS boards`)
    await client.query(`DROP TABLE IF EXISTS board_lists`)
    await client.query(`DROP TABLE IF EXISTS lists`)
    await client.query(`DROP TABLE IF EXISTS cards`)
    await client.query(`DROP TABLE IF EXISTS user_to_board`)

    await client.query(`CREATE TABLE users(
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    await client.query(`CREATE TABLE sessions(
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      session TEXT NOT NULL,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    await client.query(`CREATE TABLE boards(
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      title TEXT NOT NULL,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    await client.query(`CREATE TABLE lists(
      id SERIAL PRIMARY KEY,
      board_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      pos INTEGER NOT NULL,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    await client.query(`CREATE TABLE cards(
      id SERIAL PRIMARY KEY,
      list_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      pos INTEGER NOT NULL,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)

    await client.query(`CREATE TABLE user_to_board(
      id SERIAL UNIQUE,
      user_id INTEGER NOT NULL,
      board_id INTEGER NOT NULL,
      creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, board_id)
    )`)

    await client.query(`
      CREATE OR REPLACE FUNCTION update_last_updated_column()   
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.last_updated = now();
          RETURN NEW;   
      END;
      $$ language 'plpgsql';
      
      CREATE TRIGGER update_users_last_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_last_updated_column();
      CREATE TRIGGER update_users_last_updated BEFORE UPDATE ON boards FOR EACH ROW EXECUTE PROCEDURE update_last_updated_column();
      CREATE TRIGGER update_users_last_updated BEFORE UPDATE ON lists FOR EACH ROW EXECUTE PROCEDURE update_last_updated_column();
      CREATE TRIGGER update_users_last_updated BEFORE UPDATE ON cards FOR EACH ROW EXECUTE PROCEDURE update_last_updated_column();
    `)
  }
}
