"use client"
import  { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
   const [form , setForm] = useState({
       name: '',
       email: '',
       password: '',
       role: 'user'
    });
    const [message, setMessage] = useState(null);
    const router = useRouter();


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const response = await fetch('/api/user_register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            

            if (!response.ok) {
                const errorData = await response.text(); // Use text() instead of json() to handle HTML response
                console.error('Error response:', errorData);
                return;
            }
            const data = await response.json();
            console.log('Success:', data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement| HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({...form, [name]: value});
    };
    
    return (
    <div>
      <h1>Register</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="role">Role:</label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
      {form && (
        <div>
          <p>Registered user:</p>
          <p>Name: {form.name}</p>
        </div>
      )}
    </div>
    )
}