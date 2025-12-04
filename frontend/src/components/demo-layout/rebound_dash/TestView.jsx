import React, { useState, useEffect } from "react";
import axios from 'axios';
import { SERVER_URL } from "../../../utils/config";
const TestView = (props) => {
    const [testing, setTesting] = useState(false);
    // const [res, setRes] = useState({});
    // const [diagnosis, setDiagnosis] = useState([]);
    // const [services, setServices] = useState([]);
    const [appeal, setAppeal] = useState('');
    const res = props.currentClaim;

    useEffect(() => {
        let res = props.currentClaim;
        console.log(res);

        setTesting(true);
        axios
            .post(`${SERVER_URL}/v2/generate_appeal`, { currentClaim: res })
            .then(d => {
                setAppeal(d.data);
                setTesting(false);
            })
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img
                        src="/arrow.svg"
                        className="h-7 w-7 cursor-pointer"
                        onClick={() => props.setIsTestView(false)}
                    />
                    <p>Go back</p>
                </div>
            </div>
            <div className="flex justify-between items-center">
                Diagnosis: {res.Diagnosis.split(':').map((row, index) => row.substring(0, 3) + '.' + row.substring(3)).join(', ')}
            </div>
            <div className="flex justify-between items-center">
                Procedure: {res.Service.split(",").map((row, index) => {
                    let rows = row.split(":");
                    return rows[0];
                }).join(', 1')}
            </div>
            <div className="flex justify-between items-center">
                Appeal letter: {testing ? "Generating..." : appeal}
            </div>
        </div>
    );
};

export default TestView;
