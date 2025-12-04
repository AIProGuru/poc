import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
  LineChart,
  Area,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { samplifyInteger } from '../../../utils/config';
import { setCategoryLabel, setCategoryValue } from '../../../redux/reducers/statistics.reducer';
import { useNavigate } from 'react-router-dom';
import { setCount, setRecovery } from "../../../redux/reducers/count.reducer";
import { useApiEndpoint } from '../../../ApiEndpointContext';
import ClaimDistributionChart from './ClaimDistributionChart';
import RecoverableViewChart from '../stat_comp/Stats2';
import HorizontalBarChart from '../stat_comp/Stats3';
import GroupedBarChart from '../stat_comp/Stats4';

const labels_bar = ['AI Approved', 'AI Pending', 'Recoverable Assigned', 'Recoverable Unassigned'];

const ReboundStatistics = () => {
  const apiUrl = useApiEndpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const BASE_URL = apiUrl
    const count = useSelector((state) => state.count.count);
  const tags = useSelector((state) => state.tags.allTags);
  const recovery = useSelector((state) => state.count.recovery);

  const [data_pie, setData_Pie] = useState([]);

  let check = useSelector((state) => state.statistics.categoryLabel).length;
  const pieLabels = useSelector((state) => state.statistics.categoryLabel);
  const pieData = useSelector((state) => state.statistics.categoryValue);
  const type = useSelector((state) => state.app.type)
  const theme = useSelector((state) => state.app.theme);
  const [artificialIntelligence, setArtificialIntelligence] = useState([]);
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchData = async (page, total = false) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/resubmitted_claims`, {
        params: {
          currentPage: page,
          perPage: 10,
          total: total.toString()
        }
      });
      setClaimsData(response.data.data);
    } catch (error) {
      console.error("There was an error fetching the claims data!", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, true);
  }, []);

  const filteredClaimsData = claimsData.filter(claim => {
    const matchesDateFrom = filterDateFrom ? new Date(claim.action_date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(claim.action_date) <= new Date(filterDateTo) : true;
    const matchesStatus = filterStatus ? claim.ApprovalStatus === filterStatus : true;
    return matchesDateFrom && matchesDateTo && matchesStatus;
  });

  const sortedClaimsData = filteredClaimsData.sort((a, b) => {
    const dateA = new Date(a.action_date);
    const dateB = new Date(b.action_date);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalAmount = filteredClaimsData.reduce((acc, claim) => acc + parseFloat(claim.Amount), 0);
  const approvedClaims = filteredClaimsData.filter(claim => claim.ApprovalStatus === 'Approved').length;
  const deniedClaims = filteredClaimsData.filter(claim => claim.ApprovalStatus === 'Denied').length;
  const pendingClaims = filteredClaimsData.filter(claim => claim.ApprovalStatus === 'Pending').length;
  const [ai_total,set_ai_total] = useState({
    count: 0,
    charges: 0,
  });

  const colors = [
    "#7c9aff",
    "#a8c2ff",
    "#78c2a3",
    "#2d71a1",
    "#aa78ff",
    "#d1aaff",
  ]



  useEffect(() => {
    if (apiUrl === '') return;
    if (pieData.length == 0) { 
      axios.get(`${apiUrl}/statistics`).then(res => {
        const label = res.data.map((row, index) => row.label)
        const value = res.data.map((row, index) => row.value)
        dispatch(setCategoryLabel(label))
        dispatch(setCategoryValue(value))
        setData_Pie(makePieData(label, value));
      })


    } else {
      setData_Pie(makePieData(pieLabels, pieData))
    }
    if (count.length == 0) {
      axios.get(`${apiUrl}/get_counts`).then((res) => {
        dispatch(setCount([
          {
            count: res.data.cnt1,
            amount: res.data.amount1
          },
          {
            count: res.data.cnt2,
            amount: res.data.amount2
          },
          {
            count: res.data.cnt3,
            amount: res.data.amount3
          },
          {
            count: res.data.cnt4,
            amount: res.data.amount4
          },
          {
            count: 0,
            amount: 0
          },
          {
            count: 0,
            amount: 0
          }
        ]));
      }).catch(err => {
      });
    }

    if (recovery.length == 0) {
      axios.get(`${apiUrl}/recovery`).then((res) => {
        dispatch(setRecovery(res.data));
      })
    }

    if (artificialIntelligence.length == 0) {
      axios.get(`${apiUrl}/get_artificial_intelligence`).then((res) => {
        setArtificialIntelligence(res.data);
      }) 
    }
  }, [apiUrl])


  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    if (artificialIntelligence.length > 0) {
      const total = artificialIntelligence.reduce((acc, item) => ({
        count: acc.count + (Number(item.Count) || 0),
        charges: acc.charges + (Number(item.Amount) || 0)
      }), { count: 0, charges: 0 });
      
      set_ai_total(total);
    }   
  }, [artificialIntelligence]);


  const recoveryClick = (data) => {
    if (data && data.activeLabel === 'Actioned') {
      const filter = { claim_status: 'resubmit' };
      navigate('/medevolve/resubmitted_claims');
    }
    if (data.activeTooltipIndex && data.activeTooltipIndex === 2) {
      const token = btoa(JSON.stringify({
        tabIndex: 6,
        selectedTags: tags,
        extra: {
          Recovery: ""
        }
      }))
      navigate(`${type === 0 ? '/rebound' : '/medevolve'}/${token}`)
    }
  }

  const makePieData = (pieLabels, pieData) => {
    let sum = pieData.reduce((sum, value) => sum + value, 0)
    return pieLabels.map((row, index) => {
      return {
        name: row,
        value: pieData[index],
        percentage: ((pieData[index] / sum) * 100).toFixed(2),
        visible: 0,
        show: true,
      }
    })
  };



  const data_bar = useSelector((state) => state.count.recovery)
  .filter((_, index) => index !== 2)
  .map((row, index) => {
    const names = ['Total', 'Actioned', 'Recovered'];
    const result = {
      name: names[index],
      NumberOfClaims: Number(row?.count || 0),
      TotalCharge: Math.round(Number(row?.amount || 0))
    };

    if (index === 0 && !aiLoading) {
      result.NumberOfClaims = Number(ai_total?.count || 0) + Number(row?.count || 0);
      result.TotalCharge = Number(ai_total?.charges || 0) + Math.round(Number(row?.amount || 0));
    }

    return result;
  });



  const data_assigned = [
    {
      name: 'AI Approved',
      value: 0
    }, {
      name: 'AI Pending',
      value: 0
    }, {
      name: 'Rec-Assigned',
      value: 0
    }, {
      name: 'Rec-Unassigned',
      value: 37851
    }
  ]

  const data_line = useSelector((state) => state.count.count).map((row, index) => {
    return {
      name: ['Recoverable', 'Non-Recoverable', 'Patient Resp', 'Delinquent', 'Payment Integrity', 'Recovered'][index],
      NumberOfClaims: row.count,
      TotalCharge: row.amount
    }
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white rounded-lg border border-solid p-2">
          <p>{`${payload[0].name} : ${payload[0].payload.payload.percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  const BarChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg p-2 border border-solid drop-shadow-lg">
          <p>{`Claim Count: ${samplifyInteger(payload[0].payload.NumberOfClaims)}`}</p>
          <p>{`Total Charges: $${samplifyInteger(payload[0].payload.TotalCharge)}`}</p>
        </div>
      );
    }

    return null;
  };

  const AreaChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg p-2 border border-solid drop-shadow-lg">
          <p>{`Claim Count: ${samplifyInteger(payload[0].payload.NumberOfClaims)}`}</p>
          <p>{`Total Charges: $${samplifyInteger(payload[0].payload.TotalCharge)}`}</p>
        </div>
      );
    }

    return null;
  };

  const RecoveryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg p-2 border border-solid drop-shadow-lg">
          <p>{`Claim Count: ${samplifyInteger(payload[0].payload.NumberOfClaims)}`}</p>
          <p>{`${payload[0].payload.name}: $${samplifyInteger(payload[0].payload.TotalCharge)}`}</p>
        </div>
      );
    }
    return null;
  };

  

  return (
    <div className='flex flex-col gap-3'>
      
    {/* New UI */}
 
<div className={ `${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2  p-2 rounded-xl`}>
        {/* 1 */}
      
    <div className={` ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} con-1  h-[120px] flex flex-col justify-between w-full rounded-xl`}>
      <div className = ' h-10 w-full flex flex-row justify-between content-center p-2'>
        <div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3882 12.8887L8.63824 10.1387" stroke="#9598B0" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.3611 10.166L8.61115 12.916" stroke="#9598B0" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8.61112 5.83247H11.3889C12.7778 5.83247 12.7778 5.13802 12.7778 4.44358C12.7778 3.05469 12.0833 3.05469 11.3889 3.05469H8.61112C7.91667 3.05469 7.22223 3.05469 7.22223 4.44358C7.22223 5.83247 7.91667 5.83247 8.61112 5.83247Z" stroke="#9598B0" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.7778 4.45703C15.0903 4.58203 16.25 5.4362 16.25 8.60981V12.7765C16.25 15.5543 15.5556 16.9431 12.0833 16.9431H7.91667C4.44444 16.9431 3.75 15.5543 3.75 12.7765V8.60981C3.75 5.44314 4.90972 4.58203 7.22222 4.45703" stroke="#9598B0" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </div>

          <div className='flex flex-row items-center'> 
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.3726 8.35156L7.00033 11.7238L3.62811 8.35156" stroke="#E20013" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 2.2793V11.6293" stroke="#E20013" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span className="ml-1 text-[15px] text-[#E20013] font-semibold">5,4%</span>
</div>
      </div>
      <div className = ' h-20 flex flex-col justify-end p-2 w-full'>
        <div> <span className = ' text-2xl font-bold'> {loading ? <>Loading</> : <>{deniedClaims}</>} </span></div>
        <div> <span className = ' text-md text-gray-400'> Denied Claims </span></div>
      </div>
    </div>

    {/* 2 */}

    <div className={` ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} con-1  h-[120px] w-full  rounded-xl`}>

    <div className = ' h-10 w-full flex flex-row justify-between content-center p-2'>
        <div>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.13232 10.8748L8.17399 11.9165L10.9518 9.13867" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M7.61109 4.83247H10.3889C11.7778 4.83247 11.7778 4.13802 11.7778 3.44358C11.7778 2.05469 11.0833 2.05469 10.3889 2.05469H7.61109C6.91664 2.05469 6.2222 2.05469 6.2222 3.44358C6.2222 4.83247 6.91664 4.83247 7.61109 4.83247Z" stroke="#9598B0" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.7778 3.45703C14.0903 3.58203 15.25 4.4362 15.25 7.60981V11.7765C15.25 14.5543 14.5556 15.9431 11.0833 15.9431H6.91667C3.44444 15.9431 2.75 14.5543 2.75 11.7765V7.60981C2.75 4.44314 3.90972 3.58203 6.22222 3.45703" stroke="#9598B0" stroke-width="1.25" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>


          </div>

          <div className='flex flex-row items-center'> 
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3726 6.65152L8.00033 3.2793L4.62811 6.65152" stroke="#14AA78" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 12.723V3.37305" stroke="#14AA78" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  <span className="ml-1 text-[15px] text-[#14AA78] font-semibold">5,4%</span>
</div>
      </div>
      <div className = ' h-20 flex flex-col justify-end p-2 w-full'>
        <div> <span className = ' text-2xl font-bold'> {loading ? <>Loading</> : <>{approvedClaims}</>} </span></div>
        <div> <span className = ' text-md text-gray-400'> Resolved Claims </span></div>
      </div>
    </div>

{/* 3 */}

    <div className={` ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} con-1  h-[120px] w-full  rounded-xl`}>
    <div className = ' h-10 w-full flex flex-row justify-between content-center p-2'>
        <div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.9444 8.61024V12.0825C16.9444 15.5547 15.5556 16.9436 12.0833 16.9436H7.91667C4.44445 16.9436 3.05556 15.5547 3.05556 12.0825V7.9158C3.05556 4.44358 4.44445 3.05469 7.91667 3.05469H11.3889" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M16.9445 8.61024H14.1667C12.0833 8.61024 11.3889 7.9158 11.3889 5.83247V3.05469L16.9445 8.61024Z" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.52779 10.6934H10.6945" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6.52779 13.4707H9.30556" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

          </div>

          <div className='flex flex-row items-center'> 
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3726 6.65152L8.00033 3.2793L4.62811 6.65152" stroke="#14AA78" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 12.723V3.37305" stroke="#14AA78" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  <span className="ml-1 text-[15px] text-[#14AA78] font-semibold">5,4%</span>
</div>
      </div>
      <div className = ' h-20 flex flex-col justify-end p-2 w-full'>
        <div> <span className = ' text-2xl font-bold'> {loading ? <>Loading</> : <>{pendingClaims}</>} </span></div>
        <div> <span className = ' text-md text-gray-400'> Under Review </span></div>
      </div>
    </div>

{/* 4 */}

    <div className={` ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} con-1  h-[120px] w-full  rounded-xl`}>
    <div className = ' h-10 w-full flex flex-row justify-between content-center p-2'>
        <div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.9444 9.99913C16.9444 13.8325 13.8333 16.9436 9.99999 16.9436C6.16666 16.9436 3.05555 13.8325 3.05555 9.99913C3.05555 6.1658 6.16666 3.05469 9.99999 3.05469C13.8333 3.05469 16.9444 6.1658 16.9444 9.99913Z" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M12.577 12.2072L10.4242 10.9225C10.0492 10.7003 9.74365 10.1656 9.74365 9.72808V6.88086" stroke="#9598B0" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>



          </div>

          <div className='flex flex-row items-center'> 
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.3726 6.65152L8.00033 3.2793L4.62811 6.65152" stroke="#14AA78" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M8 12.723V3.37305" stroke="#14AA78" stroke-width="1.4" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

  <span className="ml-1 text-[15px] text-[#14AA78] font-semibold">5,4%</span>
</div>
      </div>
      <div className = ' h-20 flex flex-col justify-end p-2 w-full'>
        <div> <span className = ' text-2xl font-bold'> 15.8 Days </span></div>
        <div> <span className = ' text-md text-gray-400'> Avg Processing time </span></div>
      </div>
    </div>
    </div> 



{/* first table */}

 <div className = 'flex gap-2 justify-center flex-wrap'>
<div className = {`${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} h-[400px] sm:w-[49.5%] w-full rounded-xl p-1`}>
<div className = {` ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} h-full w-full overflow-y-hidden rounded-xl`}>
  <ClaimDistributionChart data={data_line}/>
</div>
  </div>

    <div className = {` ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} h-[400px] sm:w-[49.5%] w-full rounded-xl p-1`}>
<div className = {`  ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} h-full w-full overflow-y-hidden rounded-xl`}>
  <RecoverableViewChart  data_pie={data_pie}/>
</div>
  </div>

</div> 


<div className = 'flex gap-2 justify-start flex-wrap'>
<div className =  {` ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} h-[400px] sm:w-[49.5%] w-full rounded-xl p-1`}>
<div className ={`  ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} h-full w-full overflow-y-hidden rounded-xl`}>
  <HorizontalBarChart data={data_bar}/>
</div>
  </div>

  {/* <div className =  {` ${theme === 'dark' ? 'bg-[#191a1d]' : 'bg-[#EFF4FE]'} h-[400px] sm:w-[49.5%] w-full rounded-xl p-1`}>
<div className = {`  ${theme === 'dark' ? 'bg-[#151619]' :'bg-white'} h-full w-full overflow-y-hidden rounded-xl`}>
  <GroupedBarChart data={data_assigned}/>
</div>
  </div> */}

</div> 


{/* New UI */}
      {/* <div className='flex flex-col lg:flex-row gap-20'>
        <div className='flex-1 h-[400px] bg-white rounded-lg border border-solid pb-10 pl-5 pr-5 pt-5'>
          <div className='h-full w-full flex'>
            <div className='[writing-mode:vertical-rl] [text-orientation:mixed] transform rotate-180 text-center'>Number of Claims</div>
            <div className='h-full w-full'>
              <span className='font-semibold text-[20px] text-[#072F40]'>Claim State View</span>
              <div className='h-[60vh] sm:h-full w-full'>
      
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data_line} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorYourRating" x1={0} y1={0} x2={0} y2={1}>
                        <stop offset="5%" stopColor='#8884d8' stopOpacity={0.8} />
                        <stop offset="95%" stopColor='#8884d8' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey={"name"} label={{ value: "Category", position: 'bottom' }} />
                    <YAxis />
                    <Tooltip content={<AreaChartTooltip />} />
                    <Area
                      type={"linear"}
                      dataKey={"NumberOfClaims"}
                      label={false}
                      stroke='#8884d8'
                      strokeWidth={2}
                      fill='url(#colorYourRating)'
                      dot={false}
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col h-[400px] w-full lg:w-[700px] bg-white rounded-lg border border-solid pb-10 pl-5 pr-5 pt-5 gap-3'>
          <span className='font-semibold text-[20px] text-[#072F40]'>Recoverable View</span>
          <div className='h-full w-full'>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data_pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius="80%"
                  paddingAngle={0}
                  label={false}
                  dataKey={"value"}
                >
                  {
                    data_pie.map((entry, index) => {
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} cursor={"pointer"}
                        onClick={() => {
                          const label = entry.name
                          if (label === 'Contractual Adj') {
                            const token = btoa(JSON.stringify({
                              tabIndex: 1,
                              selectedTags: ['Contractual Adj']
                            }))
                            navigate(`${type === 0 ? '/rebound' : '/medevolve'}/${token}`)
                          }
                          else if (label === 'Patient Resp') {
                            const token = btoa(JSON.stringify({
                              tabIndex: 2,
                              selectedTags: ['Patient Resp']
                            }))
                            navigate(`${type === 0 ? '/rebound' : '/medevolve'}/${token}`)
                          }
                          else {
                            const token = btoa(JSON.stringify({
                              tabIndex: 0,
                              selectedTags: [label]
                            }))
                            navigate(`${type === 0 ? '/rebound' : '/medevolve'}/${token}`)
                          }
                        }}
                      />
                    })
                  }
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout='vertical'
                  align='right'
                  verticalAlign='middle'
                  iconType='circle'
                  iconSize={9}
                  formatter={(value, entry) => {
                    return <span
                      className={`font-semibold text-[${colors[data_pie.findIndex(item => item.name === entry.value) % colors.length]}] cursor-pointer select-none
                  ${entry.payload.show === true ? '' : 'line-through'}
                  `}
                      onClick={() => {
                        let data = data_pie;
                        for (let i = 0; i < data.length; i++) {
                          if (entry.value === data[i].name) {
                            data[i].visible = [data[i].value, data[i].value = data[i].visible][0];
                            data[i].show = !data[i].show
                          }
                        }
                        setData_Pie([...data]);
                      }}
                    >
                      {entry.value} {entry.payload.value + entry.payload.visible}
                    </span>
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div> */}
      {/* <div className='flex flex-col lg:flex-row gap-20'>
      <div className='flex-1 h-[400px] bg-white rounded-lg border border-solid pb-10 pl-5 pr-5 pt-5'>
      <div className='h-full w-full flex'>
        <div className='[writing-mode:vertical-rl] [text-orientation:mixed] transform rotate-180 text-center'>Claim Count</div>
        <div className='h-full w-full'>
          <span className='font-semibold text-[20px] text-[#072F40] mb-10'>AI Automation Recovery Report</span>
          <div className='h-[70vh] sm:h-full w-full mt-10'>
        
          <ResponsiveContainer width="100%" height="100%">
  <ComposedChart 
    data={data_bar} 
    margin={{ top: 20, right: 30, left: 20, bottom: 20 }} 
    onClick={recoveryClick} 
    cursor="pointer"
  >
    <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
    <XAxis dataKey={"name"} label={{  position: 'insideBottom', offset: -10 }} />
    
    <YAxis 
      yAxisId="left" 
      orientation="left" 
      domain={[0, (dataMax) => dataMax < 10000 ? dataMax : 10000]}  // Dynamically set max to the lower of actual max or 10k
      tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
      
    />
    
    <Tooltip content={<RecoveryTooltip />} />
    
    <Legend verticalAlign="bottom" align="center" height={36} />

    <Bar yAxisId="left" dataKey="NumberOfClaims" fill="#82ca9d" />
  </ComposedChart>
</ResponsiveContainer>



          </div>
        </div>
      </div>
    </div>
    <div className='flex flex-col h-[400px] w-full lg:w-[700px] bg-white rounded-lg border border-gray-200 shadow-md p-5 gap-4'>
  <div className='flex items-center justify-between'>
    <span className='font-semibold text-[20px] text-[#072F40]'>Assigned View</span>
    
  </div>
  <div className='h-full w-full flex'>
    <div className='[writing-mode:vertical-rl] [text-orientation:mixed] transform rotate-180 text-center text-gray-600'>Number of Claims</div>
    <div className='h-full w-full'>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data_assigned} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray={"3 3"} vertical={false} />
          <XAxis dataKey={"name"} label={{ value: "Category", position: 'insideBottom', offset: -10 }} />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          <Bar
            dataKey="value"
            fill="#FDA29B"
            barSize={30}
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>
      </div> */}
    </div>
  );
}

export default ReboundStatistics;