import React, { useEffect, useState } from "react";
// import Upvote from "./components/Upvote";
import { Connection, PublicKey, clusterApiUrl, SystemProgram } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';

import './App.css';
import twitterLogo from './assets/twitter-logo.svg';

import idl from "./idl.json";
import kp from "./keypair.json";

const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
};

// Constants
const TWITTER_HANDLE = 'heyztb';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGiftList] = useState([]);

  // const [tipValue, setTipValue] = useState(0.05);
  // const [didConfirmSolAmount, setDidConfirmSolAmount] = useState(false);
  // const [solAmountError, setSolAmountError] = useState("");
  // const [isSolAmountErrorSet, setIsSolAmountErrorSet] = useState(false);

  // const [tipActionError, setTipActionError] = useState("");
  // const [isTipActionErrorSet, setIsTipActionErrorSet] = useState(false);
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log("Connected with public key", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Go download Phantom Wallet from https://phantom.app");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with public key: ", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {

    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One Time Initialization for GIF Program Account
          </button>
        </div>
      )
    } else {
      return (
    <div className="connected-container">
      <form onSubmit={(event) => {
        event.preventDefault();
        sendGif();
      }}>
        <input type="text" placeholder="Enter a link to your GIF!" value={inputValue} onChange={onInputChange} />
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>

      <div className="gif-grid">
        {gifList.map((item, index) => (
          <div className="gif-item" key={index}>
            <img src={item.gifLink} alt={item.gifLink} />
            <p>Submitted by: {item.userAddress.toString()}</p>
            {/* <Upvote /> */}
          </div>
        ))}
      </div>
    </div>
      )
    }

  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No GIF link given!");
      return;
    }
    setInputValue('');
    console.log("GIF Link: ", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey
        }
      });

      console.log("GIF successfully sent to program: ", inputValue);
      await getGifList();
    } catch (e) {
      console.log(e);
    }
  }

  // const upvoteGif = async (index) => {
  //   try {
  //     const provider = getProvider();
  //     const program = new Program(idl, programID, provider);

  //     await program.rpc.upvoteGif(index.toString(), {
  //       accounts: {
  //         baseAccount: baseAccount.publicKey
  //       }
  //     });

  //     console.log("Upvoted GIF:", index);
  //     await getGifList();
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // const validateTipValue = (value) => {
  //   const parsedValue = Number(value);

  //   if (parsedValue < 0.05) {
  //     setSolAmountError("Entered amount is too low. Minimum tip is 0.05 SOL.");
  //     setIsSolAmountErrorSet(true);
  //   } else if (parsedValue > 50) {
  //     setSolAmountError("Entered amount is too high. Maximum tip is 50 SOL.");
  //     setIsSolAmountErrorSet(true);
  //   } else {
  //     setSolAmountError("");
  //     setIsSolAmountErrorSet(false);
  //     setDidConfirmSolAmount(true);
  //     setTipValue(value);
  //   }
  // }

  // const sendTip = async (sendingAddress, amount_in_sol, receivingAddress) => {
  //   try {
  //     const provider = getProvider();
  //     const senderAddress = new PublicKey(sendingAddress);

  //     const transactionInstruction = SystemProgram.transfer(
  //       {
  //         fromPubkey: senderAddress,
  //         lamports: amount_in_sol * LAMPORTS_PER_SOL,
  //         toPubkey: new PublicKey(receivingAddress)
  //       }
  //     )

  //     const transaction = new Transaction().add(transactionInstruction);
  //     transaction.feePayer = senderAddress;
  //     transaction.recentBlockhash = (await provider.connection.getRecentBlockhash()).blockhash;
      
  //     const signature = await provider.send(transaction);
  //     console.log("Transaction sent: ", signature);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }


  const createGifAccount = async () => {
    try {

      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });

      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString());
      await getGifList();
    } catch (e) {
      console.log(e);
    }
  }

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account: ", account);
      setGiftList(account.gifList);
    } catch (e) {
      console.log(e);
      setGiftList(null);
    }
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }

    window.addEventListener('load', onLoad);
    return () => {
      window.removeEventListener('load', onLoad);
    }
  }, [])

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");
      getGifList()
    }
    //eslint-disable-next-line
  }, [walletAddress])

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 Crypto GIF Portal</p>
          <p className="sub-text">
            Submit your favorite crypto GIFs ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container text-red-600">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
