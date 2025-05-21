import {Client} from 'pg'

export const conn = new Client({
    user:"postgres",
    host:"localhost",
    database:"notesapidb",
    password:"root123",
    port:5432
})

export default conn 