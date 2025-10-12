import autocannon from "autocannon"
import fs from "fs"
import fetch from "node-fetch"

// Read the JSON data file
const dataFile = fs.readFileSync('./data-test-multiplied-shuffled.json', 'utf8')
const data = JSON.parse(dataFile)
const urls = data.urls

// Track current index for reading URLs row by row
let currentUrlIndex = 0

// Track job completion times
const jobCompletionTimes = []
const jobSubmissionTimes = []

// Function to get next URL from the data
function getNextUrl() {
  if (currentUrlIndex >= urls.length) {
    currentUrlIndex = 0 // Reset to beginning when we reach the end
  }
  const url = urls[currentUrlIndex]
  currentUrlIndex++
  return url
}

// Function to poll job completion status
async function pollJobCompletion() {
  const startTime = Date.now()
  const maxWaitTime = 300000 // 5 minutes max wait
  const pollInterval = 2000 // 2 seconds
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch('http://localhost:3000/api/scrape/v2/stats', {
        headers: {
          "Authorization": "Basic " + Buffer.from("user:pass").toString("base64")
        }
      })
      
      if (response.ok) {
        const stats = await response.json()
        if (stats.data && stats.data.waiting === 0 && stats.data.active === 0) {
          const totalTime = Date.now() - startTime
          jobCompletionTimes.push(totalTime)
          console.log(`✅ All jobs completed in ${totalTime}ms`)
          return totalTime
        }
      }
    } catch (error) {
      console.error('Error polling job status:', error.message)
    }
    
    await new Promise(resolve => setTimeout(resolve, pollInterval))
  }
  
  console.log('⚠️ Timeout waiting for job completion')
  return null
}

const instance = autocannon({
  url: "http://localhost:3000/api/scrape/v2",
  method: "POST",
  amount:5000,          // total requests
  connections: 100,       // simulate 100 concurrent clients
  pipelining: 1,
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic " + Buffer.from("user:pass").toString("base64"),
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  },
  requests: [{
    path: "/api/scrape/v2",
    setupRequest: (req, ctx) => {
      // Get next URL from the JSON data row by row
      const url = getNextUrl()
      req.body = JSON.stringify({
        urls: [url]
      })
      return req
    }
  }]
}, (err, result) => {
  if (err) {
    console.error('Load test error:', err)
    return
  }
  
  // Store submission completion time
  const submissionEndTime = Date.now()
  jobSubmissionTimes.push(result.duration * 1000) // Convert to milliseconds
  
  console.log(`📊 Job submission completed in ${result.duration * 1000}ms`)
  console.log('🔄 Starting job completion monitoring...')
  
  // Start polling for job completion
  pollJobCompletion().then(completionTime => {
    if (completionTime) {
      displayEnhancedResults(result, completionTime)
    } else {
      displayEnhancedResults(result, null)
    }
  })
})

// Enhanced results display function
function displayEnhancedResults(result, totalCompletionTime) {
  console.log("\n" + "=".repeat(60))
  console.log("🚀 SCRAPE V2 API LOAD TEST RESULTS")
  console.log("=".repeat(60))
  
  // Basic Performance Metrics
  console.log("\n📊 PERFORMANCE METRICS")
  console.log("-".repeat(40))
  console.log(`⏱️  Duration: ${result.duration.toFixed(2)}s`)
  console.log(`📈 Requests/sec: ${result.requests.average.toFixed(2)}`)
  console.log(`📊 Total Requests: ${result.requests.total}`)
  console.log(`🔗 Connections: ${result.connections}`)
  console.log(`📦 Pipelining: ${result.pipelining}`)
  
  // NEW: Job Processing Times
  console.log("\n⏱️  JOB PROCESSING TIMES")
  console.log("-".repeat(40))
  console.log(`📤 Job Submission Time: ${(result.duration * 1000).toFixed(2)}ms`)
  if (totalCompletionTime) {
    console.log(`✅ Total Processing Time: ${totalCompletionTime}ms`)
    console.log(`🔄 Queue Processing Time: ${(totalCompletionTime - result.duration * 1000).toFixed(2)}ms`)
    console.log(`📊 Processing Efficiency: ${((result.duration * 1000) / totalCompletionTime * 100).toFixed(2)}% submission, ${((totalCompletionTime - result.duration * 1000) / totalCompletionTime * 100).toFixed(2)}% processing`)
  } else {
    console.log(`⚠️  Total Processing Time: Timeout (jobs may still be processing)`)
  }
  
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

}

autocannon.track(instance)
