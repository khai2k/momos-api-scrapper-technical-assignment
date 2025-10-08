import autocannon from "autocannon"
import fs from "fs"

// Read the JSON data file
const dataFile = fs.readFileSync('./data-test.json', 'utf8')
const data = JSON.parse(dataFile)
const urls = data.urls

// Track current index for reading URLs row by row
let currentUrlIndex = 0

// Function to get next URL from the data
function getNextUrl() {
  if (currentUrlIndex >= urls.length) {
    currentUrlIndex = 0 // Reset to beginning when we reach the end
  }
  const url = urls[currentUrlIndex]
  currentUrlIndex++
  return url
}

const instance = autocannon({
  url: "http://localhost:3000/api/scrape",
  method: "POST",
  amount:1000,          // total requests
  connections: 50,       // simulate 50 concurrent clients
  pipelining: 1,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic " + Buffer.from("user:pass").toString("base64")
  },
  requests: [{
    path: "/api/scrape",
    setupRequest: (req, ctx) => {
      // Get next URL from the JSON data row by row
      const url = getNextUrl()
      req.body = JSON.stringify({
        urls: [url]
      })
      return req
    }
  }]
})

autocannon.track(instance)
instance.on("done", result => {
  console.log("\n" + "=".repeat(60))
  console.log("🚀 LOAD TEST RESULTS")
  console.log("=".repeat(60))
  
  // Basic Performance Metrics
  console.log("\n📊 PERFORMANCE METRICS")
  console.log("-".repeat(40))
  console.log(`⏱️  Duration: ${result.duration.toFixed(2)}s`)
  console.log(`📈 Requests/sec: ${result.requests.average.toFixed(2)}`)
  console.log(`📊 Total Requests: ${result.requests.total}`)
  console.log(`🔗 Connections: ${result.connections}`)
  console.log(`📦 Pipelining: ${result.pipelining}`)
  
  // Response Status Codes
  console.log("\n📋 RESPONSE STATUS CODES")
  console.log("-".repeat(40))
  console.log(`✅ 2xx Success: ${result['2xx']}`)
  console.log(`🔄 3xx Redirects: ${result['3xx']}`)
  console.log(`⚠️  4xx Client Errors: ${result['4xx']}`)
  console.log(`❌ 5xx Server Errors: ${result['5xx']}`)
  console.log(`🚫 Non-2xx Total: ${result.non2xx}`)
  console.log(`❌ Errors: ${result.errors}`)
  console.log(`⏰ Timeouts: ${result.timeouts}`)
  
  // Latency Statistics
  console.log("\n⏱️  LATENCY STATISTICS (ms)")
  console.log("-".repeat(40))
  console.log(`📊 Average: ${result.latency.average.toFixed(2)}`)
  console.log(`📈 Mean: ${result.latency.mean.toFixed(2)}`)
  console.log(`📉 Min: ${result.latency.min}`)
  console.log(`📈 Max: ${result.latency.max}`)
  console.log(`📊 Std Dev: ${result.latency.stddev.toFixed(2)}`)
  console.log(`📊 P50 (Median): ${result.latency.p50}`)
  console.log(`📊 P90: ${result.latency.p90}`)
  console.log(`📊 P95: ${result.latency.p97_5}`)
  console.log(`📊 P99: ${result.latency.p99}`)
  
  // Throughput Statistics
  console.log("\n🚀 THROUGHPUT STATISTICS (bytes/sec)")
  console.log("-".repeat(40))
  console.log(`📊 Average: ${result.throughput.average.toFixed(2)}`)
  console.log(`📈 Mean: ${result.throughput.mean.toFixed(2)}`)
  console.log(`📉 Min: ${result.throughput.min}`)
  console.log(`📈 Max: ${result.throughput.max}`)
  console.log(`📊 Total: ${result.throughput.total}`)
  
  // Performance Analysis
  console.log("\n🔍 PERFORMANCE ANALYSIS")
  console.log("-".repeat(40))
  
  // Success Rate
  const successRate = ((result['2xx'] / result.sampleInt) * 100).toFixed(2)
  console.log(`✅ Success Rate: ${successRate}%`)
  
  // Error Rate
  const errorRate = (100-successRate).toFixed(2)
  console.log(`❌ Error Rate: ${errorRate}%`)
  
  // Performance Grade
  let performanceGrade = "A"
  if (result.latency.average > 2000) performanceGrade = "C"
  else if (result.latency.average > 1000) performanceGrade = "B"
  else if (result.latency.average > 500) performanceGrade = "B+"
  
  console.log(`🏆 Performance Grade: ${performanceGrade}`)
})
