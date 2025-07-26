import React, { useEffect, useState } from "react";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/auth/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="users-wrapper">
      <h2>Registered Users</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Role</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.role}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
