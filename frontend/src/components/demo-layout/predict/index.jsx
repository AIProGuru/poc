import React, { useState } from "react";
import axios from 'axios';
import { SERVER_URL } from "../../../utils/config";

const Predict = () => {
    const [diagnosis, setDiagnosis] = useState('')
    const [service, setService] = useState('')
    const [result, setResult] = useState('')

    const onPredict = () => {
        axios.post(`${SERVER_URL}/v2/predict`, { diagnosis: diagnosis.split(" "), service: service.split(" ") }).then(res => setResult(res.data))
    }

    return (<div className="text-blue-600 flex flex-col gap-4">
        <input
            type="text"
            id="simple-search"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Input Diagnosis"
            required
        />
        <input
            type="text"
            id="simple-search"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Input Services"
            required
        />
        <button className="rounded-full bg-blue-600 text-white px-4 py-2 flex w-[150px] text-center" onClick={onPredict}>Predict</button>
        <input
            type="text"
            id="simple-search"
            value={result}
            readOnly
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="The result is shown here"
            required
        />
        <div>
            <div>Example:</div>
            <br />
            <div>Diagnosis: M25.311 M75.91 Y93.64</div>
            <div>Service: 99213</div>
            <div>Adjustment: CO45,PR3</div>
            <br />

            <div>Diagnosis: T84.038A Z96.611</div>
            <div>Service: 23473</div>
            <div>Adjustment: CO45</div>
            <br />

            <div>Diagnosis: M43.16 M43.17 M48.061 M48.07 M53.2X6 M53.2X7</div>
            <div>Service: 22633 22634 22842 22853 63052 63053</div>
            <div>Adjustment: CO144,CO253,CO45,PR2</div>
        </div>
    </div>)
}

export default Predict;