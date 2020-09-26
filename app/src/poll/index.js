import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import PollABI from '../contracts/poll.json'
import { account } from '../constants'
// set web3 provider
const web3 = new Web3(new
  Web3.providers
    .HttpProvider("http://localhost:8545"));
const defaultAddress = '0xc9eFedA83BA578c1ac78531aE2DDbba1aF30A0E3'
const contract = new web3.eth.Contract(PollABI, defaultAddress);
contract.setProvider(web3.currentProvider);

function Poll() {
  const [question, setQuestion] = useState('')
  const [option0, setOption0] = useState('')
  const [option1, setOption1] = useState('')
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [address, setAddress] = useState(account)
  const [polls, setPolls] = useState([])
  const [voterKey, setVoterKey] = useState('')
  // get polls id
  useEffect(() => {
    getAllPolls()
  }, [])

  const getAllPolls = async () => {
    const PollsId = await contract.methods.getPollsId().call();
    let tempPolls = [];
    await PollsId.map(async (id) => {
      const { question, _options, results } = await contract.methods.getPollById(id).call();
      let poll = {
        id,
        question,
        results,
        options: _options
      }
      console.log(results)
      tempPolls.push(poll)
    })
    setPolls(tempPolls)
  }

  const createNewPoll = e => {
    e.preventDefault()
    const options = [option0, option1]
    contract.methods.createNewPoll(question, options, name, key, address).send({ from: account, gas: 3000000 }).then((res) => {
      const { id, question } = res.events.CreationSuccess.returnValues
      console.log(id, question)
    })
  }

  const voteForOptions = (id, index, voterKey) => {
    contract.methods.voteForOptions(id, index, voterKey).send({ from: account, gas: 3000000 }).then((res) => {
      const { id, results } = res.events.VoteSuccess.returnValues
      console.log(id, results)
    })
  }

  return (
    <div className="Poll">
      <hr></hr>
      <h1>Poll</h1>
      <form onSubmit={createNewPoll}>
        <label>sender name: </label>
        <input value={name} onChange={e => setName(e.target.value)}></input>
        <br />
        <label>sender key: </label>
        <input value={key} onChange={e => setKey(e.target.value)}></input>
        <br />
        <label>sender address: </label>
        <input value={address} onChange={e => setAddress(e.target.value)}></input>
        <br />
        <label>question: </label>
        <input value={question} onChange={e => setQuestion(e.target.value)}></input>
        <br />
        <label>options:</label>
        <input value={option0} onChange={e => setOption0(e.target.value)} />
        <br />
        <input value={option1} onChange={e => setOption1(e.target.value)} />
        <br />
        <button onClick={createNewPoll}>Send A New Poll</button>
      </form>
      <label>Voter KEY</label>
      <input value={voterKey} onChange={e => setVoterKey(e.target.value)} />
      <br />
      <div style={{ marginTop: '100px' }}>
        {polls.map((poll, index) => (
          <div key={index}>
            <div>{poll.question}</div>
            <ul>
              {
                poll.options ? poll.options.map((option, oIndex) => (
                  <li key={oIndex} onClick={() => voteForOptions(poll.id, oIndex, voterKey)} style={{ display: 'flex', justifyContent: 'space-between', width: '500px' }}>
                    <span>{option}</span>
                    {poll.results ? <span>{poll.results[oIndex]}</span> : null}
                  </li>
                )) : null
              }
            </ul>
            <hr />
          </div>))}
      </div>
    </div>
  );
}

export default Poll;