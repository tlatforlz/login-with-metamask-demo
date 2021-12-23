import './Login.css';

import React, { useState } from 'react';
import Web3 from 'web3';

import { Auth } from '../types';
import axios from 'axios';

interface Props {
	onLoggedIn: (auth: Auth) => void;
}

let web3: Web3 | undefined = undefined; // Will hold the web3 instance

export const Login = ({ onLoggedIn }: Props): JSX.Element => {
	const [loading, setLoading] = useState(false); // Loading button state

	const handleAuthenticate = ({
		publicAddress,
		signature,
	}: {
		publicAddress: string;
		signature: string;
	}) =>
	{
		const data = {
			publicAddress,
			signature
		}
		axios.post(`${process.env.REACT_APP_BACKEND_URL}/verify`, data)
		.then(res => {
			const data = res.data.data;
			if (data != null) {
				onLoggedIn({
					...data
				});
			}
		})
	};

	const handleSignMessage = async ({
		publicAddress,
		nonce,
	}: {
		publicAddress: string;
		nonce: string;
	}) => {
		try {
			const signature = await web3!.eth.personal.sign(
				`I am signing my one-time nonce: ${nonce}`,
				publicAddress,
				'' // MetaMask will ignore the password argument here
			);
			return { publicAddress, signature };
		} catch (err) {
			throw new Error(
				'You need to sign the message to be able to log in.'
			);
		}
	};

	const handleSignup = (publicAddress: string) => {
		const data = {
			publicAddress: publicAddress
		};
		return axios.post(`${process.env.REACT_APP_BACKEND_URL}/user`, data)
		.then(res => {
			const data = res.data.data;

			console.log(data);
			return {
				publicAddress: data.u,
				nonce: data.nonce
			}
		})
	};

	const handleClick = async () => {
		// Check if MetaMask is installed
		if (!(window as any).ethereum) {
			window.alert('Please install MetaMask first.');
			return;
		}

		if (!web3) {
			try {
				// Request account access if needed
				await (window as any).ethereum.enable();

				// We don't know window.web3 version, so we use our own instance of Web3
				// with the injected provider given by MetaMask
				web3 = new Web3((window as any).ethereum);
			} catch (error) {
				window.alert('You need to allow MetaMask.');
				return;
			}
		}

		const coinbase = await web3.eth.getCoinbase();
		if (!coinbase) {
			window.alert('Please activate MetaMask first.');
			return;
		}

		const publicAddress = coinbase.toLowerCase();
		setLoading(true);
		
		axios
			.get(`${process.env.REACT_APP_BACKEND_URL}/user?publicAddress=${publicAddress}`)
			.then(res => {
				console.log(res);
				if (res != null && res.data != null && res.data.code == 200) {
					const user = res.data.data;
					handleSignMessage({
						publicAddress: user.publicAddress,
						nonce: user.nonce
					})
					.then(handleAuthenticate)
				} else {
					handleSignup(publicAddress).then(user => {
						handleSignMessage({
							publicAddress: user.publicAddress,
							nonce: user.nonce
						})
						.then(handleAuthenticate);
					});
				}
			});
	};

	return (
		<div>
			<p>
				Please select your login method.
				<br />
				For the purpose of this demo, only MetaMask login is
				implemented.
			</p>
			<button className="Login-button Login-mm" onClick={handleClick}>
				{loading ? 'Loading...' : 'Login with MetaMask'}
			</button>
		</div>
	);
};
