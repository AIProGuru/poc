import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useApiEndpoint } from "../../../ApiEndpointContext";
import {
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  ResponsiveContainer,
} from 'recharts';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const ResubmittedClaims = () => {
  const apiUrl = useApiEndpoint();
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewTotal, setViewTotal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const BASE_URL = apiUrl;

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
    fetchData(page, viewTotal);
  }, [page, viewTotal]);

  if (loading) {
    return <div>Loading ...</div>
  }

  const filteredClaimsData = claimsData.filter(claim => {
    const matchesSearchTerm = claim.ClaimNo.toString().includes(searchTerm);
    const matchesDateFrom = filterDateFrom ? new Date(claim.action_date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(claim.action_date) <= new Date(filterDateTo) : true;
    const matchesStatus = filterStatus ? claim.ApprovalStatus === filterStatus : true;
    return matchesSearchTerm && matchesDateFrom && matchesDateTo && matchesStatus;
  });

  const sortedClaimsData = filteredClaimsData.sort((a, b) => {
    const dateA = new Date(a.action_date);
    const dateB = new Date(b.action_date);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const chartData = sortedClaimsData.reduce((acc, claim) => {
    const date = new Date(claim.action_date).toLocaleDateString('en-US', { timeZone: 'UTC' });
    if (!acc[date]) {
      acc[date] = { date, amount: 0, count: 0 };
    }
    acc[date].amount += parseFloat(claim.Amount);
    acc[date].count += 1;
    return acc;
  }, {});

  const formattedChartData = Object.values(chartData).map(data => ({
    ...data,
    avgAmount: data.amount / data.count,
  })).sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalClaims = filteredClaimsData.length;
  const totalAmount = filteredClaimsData.reduce((acc, claim) => acc + parseFloat(claim.Amount), 0);

  const approvedClaims = filteredClaimsData.filter(claim => claim.ApprovalStatus === 'Approved').length;
  const deniedClaims = filteredClaimsData.filter(claim => claim.ApprovalStatus === 'Denied').length;
  const PendingClaims = filteredClaimsData.filter(claim => claim.ApprovalStatus === 'Pending').length;

  const handleClaimClick = (claimId) => {
    const encodedClaimId = btoa(JSON.stringify({ claimNo: claimId }));
    navigate(`/medevolve/detail/${encodedClaimId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="container mx-auto p-6 bg-[#fefeff] min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Resubmitted Claims Insights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border-[#eef4ff] border-[10px] rounded-3xl p-6 mt-5">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Claims Amount Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={formattedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" name="Total Amount" />
              <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" name="Number of Claims" />
              <Area type="monotone" dataKey="avgAmount" stroke="#ffc658" fill="#ffc658" name="Average Amount" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white  border-[#eef4ff] border-[10px] rounded-3xl p-6 mt-5">
          {/* <h2 className="text-2xl font-semibold mb-4 text-gray-700">Claims Metrics</h2> */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-3xl text-gray-600">Total Claims</span>
              <span className="text-3xl font-semibold text-gray-800">{totalClaims}</span>
            </div>
            <hr className="my-5"></hr>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600">Total Amount</span>
              <span className="text-lg font-semibold text-gray-800">${totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600">Approved Claim Count</span>
              <span className="text-lg font-semibold text-gray-800">{approvedClaims}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600">Denied Claim Count</span>
              <span className="text-lg font-semibold text-gray-800">{deniedClaims}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-lg text-gray-600">Pending Claim Count</span>
              <span className="text-lg font-semibold text-gray-800">{PendingClaims}</span>
            </div>
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 bg-white  rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">Claims List</h2>
          <div className="flex mb-4">
            <input
              type="text"
              placeholder="Search by Claim ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-3 border rounded-xl border-gray-300 flex-grow mr-2"
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow"
              style={{ width: '10%' }}
              onClick={() => setIsModalOpen(true)}
            >
              Filter
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded shadow ml-2"
              style={{ width: '10%' }}
              onClick={() => setViewTotal(!viewTotal)}
            >
              {viewTotal ? "View Paginated" : "View Total"}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white  border-[#eef4ff] border-[10px] rounded-3xl">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Claim ID</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Action Type</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Charged Amount</th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 cursor-pointer" onClick={toggleSortOrder}>
                    Action Date {sortOrder === "asc" ? "↑" : "↓"}
                  </th>
                  <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Claim Status</th>
                </tr>
              </thead>
              <tbody>
                {sortedClaimsData.map((claim) => (
                  <tr key={claim.ClaimNo} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleClaimClick(claim.ClaimNo)}>
                    <td className="py-3 px-4 border-b text-sm text-gray-700">{claim.ClaimNo}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-700">{claim.claim_status}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-700">${parseFloat(claim.Amount).toFixed(2)}</td>
                    <td className="py-3 px-4 border-b text-sm text-gray-700">
                      {new Date(claim.action_date).toLocaleDateString('en-US')}
                    </td>
                    {
  claim.ApprovalStatus === 'Approved' ? (
    <td className="py-3 px-4 border-b text-sm text-white">
      <span className="bg-green-400 p-2 rounded-2xl">{claim.ApprovalStatus}</span>
    </td>
  ) : claim.ApprovalStatus === 'Pending' ? (
    <td className="py-3 px-4 border-b text-sm text-white">
      <span className="bg-yellow-400 p-2 rounded-2xl">{"In-process"}</span>
    </td>
  ) : (
    <td className="py-3 px-4 border-b text-sm text-white">
      <span className="bg-red-400 p-2 rounded-2xl">{claim.ApprovalStatus}</span>
    </td>
  )
}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow"
              onClick={() => setPage(page => Math.max(page - 1, 1))}
              disabled={page === 1 || viewTotal}
            >
              Previous
            </button>
            <span className="text-lg text-gray-700">Page {page}</span>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded shadow"
              onClick={() => setPage(page => page + 1)}
              disabled={viewTotal}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="filter-modal-title"
        aria-describedby="filter-modal-description"
      >
        <Box className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700" id="filter-modal-title">Filter Claims</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="p-3 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="p-3 border border-gray-300 rounded w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Approval Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded w-full"
              >
                <option value="">All</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded shadow mr-2"
                onClick={() => setIsModalOpen(false)}
              >
                Apply
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded shadow"
                onClick={() => {
                  setFilterDateFrom("");
                  setFilterDateTo("");
                  setFilterStatus("");
                  setIsModalOpen(false);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ResubmittedClaims;