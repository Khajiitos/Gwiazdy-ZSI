import mysql from "mysql2/promise";

async function getConnection() {
	return mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME
	});
}

// --- Imgs ---
export async function getImgById(id) {
	const con = await getConnection();
	const [[data]] = await con.query("SELECT * FROM images WHERE id = ?;", [
		Number(id),
	]);
	con.end();

	return data;
}

export async function getImgsByTagId(tagid) {
	const con = await getConnection();
	const [data] = await con.query(
		"SELECT images.* FROM images JOIN imagesteachers ON images.id = imagesteachers.id_images WHERE imagesteachers.id_teachers = ?;",
		[Number(tagid)]
	);
	con.end();

	if (!data[0]) {
		return [];
	}

	return data;
}

export async function getNextImg(id) {
	const con = await getConnection();
	const [[data]] = await con.query(
		"SELECT id FROM images WHERE id > ? LIMIT 1;",
		[Number(id)]
	);
	con.end();

	return data.id;
}
export async function getPreviousImg(id) {
	const con = await getConnection();
	const [[data]] = await con.query(
		"SELECT id FROM images WHERE id < ? ORDER BY id DESC LIMIT 1;",
		[Number(id)]
	);
	con.end();

	return data.id;
}

export async function getRandomImg() {
	const con = await getConnection();
	const [[data]] = await con.query(
		"SELECT id FROM images ORDER BY RAND() LIMIT 1;"
	);
	con.end();

	return data.id;
}

// --- Tags ---
export async function addTag(imageId, teachersId) {
	const con = await getConnection();
	await con.query(
		"INSERT INTO imagesteachers (id, id_images, id_teachers) VALUES (NULL, ?, ?);",
		[imageId, teachersId]
	);
	const [[data]] = await con.query("SELECT * FROM teachers WHERE id = ?;", [
		teachersId,
	]);
	con.end();
	return data;
}

export async function deleteTag(imageID, teachersID) {
	const con = await getConnection();
	await con.query(
		"DELETE FROM imagesteachers WHERE id_images = ? AND id_teachers = ?;",
		[imageID, teachersID]
	);
	con.end();
}

// --- Teachers ---

export async function getTeachers() {
	const con = await getConnection();
	const [data] = await con.query("SELECT * FROM teachers;");
	con.end();

	return data;
}

export async function getSelectedTeachers(imageId) {
	const con = await getConnection();
	const [data] = await con.query(
		"SELECT teachers.* FROM images LEFT JOIN imagesteachers ON images.id = imagesteachers.id_images LEFT JOIN teachers ON imagesteachers.id_teachers = teachers.id WHERE images.id = ?;",
		[imageId]
	);
	con.end();

	if (!data[0].id) {
		return [];
	}

	return data;
}

export async function searchTeachers(prompt) {
	const con = await getConnection();
	const [data] = await con.query(
		'SELECT * FROM teachers WHERE name LIKE CONCAT("%", ?, "%") LIMIT 5;',
		[String(prompt)]
	);
	con.end();

	if (!data[0]) {
		return [];
	}

	return data;
}

export async function searchUnselectedTeachers(imageId, prompt) {
	const con = await getConnection();
	const [data] = await con.query(
		'SELECT * FROM teachers WHERE name LIKE CONCAT("%", ?, "%") GROUP BY id HAVING NOT id IN ( SELECT teachers.id FROM teachers JOIN imagesteachers ON teachers.id = imagesteachers.id_teachers WHERE imagesteachers.id_images = ? ) LIMIT 5;',
		[String(prompt), Number(imageId)]
	);
	con.end();

	if (!data[0]) {
		return [];
	}

	return data;
}

// --- Users ---

export async function getUser(login) {
	const con = await getConnection();

	const [[data]] = await con.query(
		"SELECT password FROM users WHERE login = ?;",
		[String(login)]
	);
	con.end();

	if (!data) {
		return null;
	}

	return data.password;
}

export async function getUserByToken(token) {
	const con = await getConnection();

	const [[data]] = await con.query(
		"SELECT login FROM users WHERE token = ?;",
		[String(token)]
	);
	con.end();

	if (!data) {
		return null;
	}

	return data.login;
}

export async function updateUserToken(login, token) {
	const con = await getConnection();

	await con.query("UPDATE users SET token = ? WHERE login = ?;", [
		String(token),
		String(login),
	]);

	con.end();
}

export async function updateUserPassword(login, password) {
	const con = await getConnection();

	await con.query("UPDATE users SET password = ? WHERE login = ?;", [
		String(password),
		String(login),
	]);

	con.end();
}

