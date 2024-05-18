"use client"
import  { useState } from 'react';
import axios from 'axios';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/user_register', {
                name,
                email,
                password: String(password),
                role
            });

            if(response.data.status === 'success'){
                alert('User registered successfully');
            } else {
                alert('Error registering user');
            }
        } catch (error) {
            console.error(error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password"  value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" />
            <button type="submit">Register</button>
        </form>
    )
}