"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useBlockNumber,
  useConnect,
  useDisconnect,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

function App() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: deployedContractData } = useDeployedContractInfo("DiceGame");

  const queryClient = useQueryClient();
  const { writeContract } = useWriteContract();

  // comment this part to test without watch (also comment balance on line 59)
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: account.chainId,
  });
  const { data: balance, queryKey } = useBalance({
    address: account.addresses?.[0],
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber, queryClient]);
  // end of part to comment

  useWatchContractEvent({
    address: deployedContractData?.address,
    abi: deployedContractData?.abi,
    chainId: account.chainId,
    onLogs: (logs: any) => {
      console.log(logs, "🟣 logs");
      logs.map((log: any) => {
        console.log(log, "🟣 log");
      });
    },
    onError(error: any) {
      console.log("ERROR FROM WATCH CONTRACT EVENT", error);
    },
    eventName: "Roll",
  });

  return (
    <>
      <div>
        {/* Added to base example */}
        <h3>Balance</h3>
        <div>{balance ? balance.formatted : 0} </div>

        <div>(trigger requires 0.002 eth)</div>

        <button
          className="btn"
          onClick={() => {
            if (!deployedContractData) {
              console.log("🟣 no contract data");
              return;
            }
            writeContract({
              address: deployedContractData?.address,
              abi: deployedContractData?.abi,
              functionName: "rollTheDice",
              args: [],
              value: parseEther("0.002"),
            });
          }}
        >
          Trigger event
        </button>
        {/* End of added part */}

        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          addresses: {JSON.stringify(account.addresses)}
          <br />
          chainId: {account.chainId}
        </div>

        {account.status === "connected" && (
          <button className="btn" type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect</h2>
        {connectors.map(connector => (
          <button className="btn" key={connector.uid} onClick={() => connect({ connector })} type="button">
            {connector.name}
          </button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  );
}

export default App;
