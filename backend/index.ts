import express from "express";
import { Connection, Keypair, SystemProgram, Transaction } from "@solana/web3.js";
const app = express();

const keyPair = Keypair.fromSecretKey(process.env.PRIVATE_KEY! as unknown as Uint8Array);
const connection = new Connection("http://api.mainnet-beta.solana.com");

app.get("/flip", async (req, res) => {
    const wonCoin = Math.random() < 0.5;
    const publicKey = req.body.publicKey;
    const betAmount = req.body.betAmount;
    const txn = req.body.txn;
    // TODO: Parse the amount from the txn siganture

    if (wonCoin) {
        // send them 2x of the amount they bet
        const winTransaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: keyPair.publicKey,
              toPubkey: publicKey,
              lamports: Math.floor(betAmount * 2),
            })
          );
          
          await connection.sendTransaction(winTransaction, [keyPair]);

        res.json({
            message: "You won"
        })
    } else {
        res.json({
            message: "You lost"
        })
    }
})


app.listen(3000);