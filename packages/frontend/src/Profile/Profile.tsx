import './Profile.css';

import jwtDecode from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import Blockies from 'react-blockies';

import { Auth } from '../types';
import axios from 'axios';

interface Props {
	auth: Auth;
	onLoggedOut: () => void;
}

interface State {
	loading: boolean;
	u: string;
	username: string;
}

interface JwtDecoded {
	payload: {
		id: string;
	};
}

export const Profile = ({ auth, onLoggedOut }: Props): JSX.Element => {
	const [state, setState] = useState<State>({
		loading: false,
		u: '',
		username: '',
	});

	useEffect(() => {
		const { token } = auth;
		const headers = { Authorization: `Bearer ${token}` };
		axios.get(`${process.env.REACT_APP_BACKEND_URL}/getUserByToken`, { headers })
		.then(res => {
			console.log(res);
			const data = res.data.data;
			console.log(data);
			setState({
				loading: false,
				u: data.u,
				username: data.userName
			});
		})
	}, []);

	const handleChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLInputElement>) => {
		setState({ ...state, username: value });
	};

	const handleSubmit = () => {
		const { token } = auth;
		const { u, username } = state;

		setState({ ...state, loading: true });

		if (!u) {
			window.alert(
				'The user id has not been fetched yet. Please try again in 5 seconds.'
			);
			return;
		}
		const headers = { Authorization: `Bearer ${token}`};
		const body = { userName: username}
		axios({
			method: 'post',
			url: `${process.env.REACT_APP_BACKEND_URL}/profile`,
			headers: headers,
			data: body
		})
		.then(res => {
			console.log(res);
			const data = res.data.data;
			console.log(data);
			setState({
				loading: false,
				u: u,
				username: username
			});
		})
	};

	const { token } = auth;
	const { loading, u, username } = state;

	return (
		<div className="Profile">
			<p>
				Logged in as <Blockies seed={u} />
			</p>
			<div>
				My publicAddress is <pre>{u}</pre>
			</div>
			{/* <div>
				<label htmlFor="username">Change username: </label>
				<input name="username" onChange={handleChange} />
				<button disabled={loading} onClick={handleSubmit}>
					Submit
				</button>
			</div> */}
			<p>
				<button onClick={onLoggedOut}>Logout</button>
			</p>
		</div>
	);
};
