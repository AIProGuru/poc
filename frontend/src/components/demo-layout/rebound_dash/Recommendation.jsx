import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";

const Recommendation = ({ data, flag }) => {
  if (data === "") return <div></div>
  if (flag === 0) return data
  if (flag === 1) {
    const splits = data.split('], ')
    let res = []
    if (splits.length > 1) {
      for (let i = 0; i < splits.length; i++) {
        const sts = splits[i].split(': [')
        res.push([sts[0], sts[1].replace(new RegExp(']', 'gi'), '').replace(new RegExp("'", 'gi'), '')])
      }
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ClaimNo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modifier</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {res.map((row, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row[0]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (flag === 3 || flag === 4) {
    const splits = data.split(',')
    let res = []
    if (splits.length > 1) {
      for (let i = 0; i < splits.length; i++) {
        if (i % 5 == 0) res.push([])
        res[res.length - 1].push(splits[i])
      }
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Payer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secondary Payer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {res.map((row, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                {row.map((r, ind) => (
                  <td key={ind} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if (flag === 5) {
    const splits = data.split(',')
    let res = []
    if (splits.length > 1) {
      for (let i = 0; i < splits.length; i++) {
        if (i % 5 == 0) res.push([])
        res[res.length - 1].push(splits[i])
      }
    }
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ClaimNo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TransactionDate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PayerName</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ClaimFrequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ServiceDateFrom</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {res.map((row, index) => (
              <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                {row.map((r, ind) => (
                  <td key={ind} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
}



export default Recommendation;