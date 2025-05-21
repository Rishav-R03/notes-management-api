import {z} from 'zod'

const userSchema = z.object({
    name:z.string().min(1,'enter valid name'),
    email:z.string().email('enter valid email'),
    password:z.string().min(8,'enter 6 characters at least!')
})

export default userSchema