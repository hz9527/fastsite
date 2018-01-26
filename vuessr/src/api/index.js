import Axios from 'axios'

let API = {
  getStars: '/api/users/hz9527/starred',
  getDetail: '/api/repos/' // owerName/repoName
}

if (process.env.VUE_ENV === 'server') {
  Object.keys(API).forEach(key => {
    API[key] = API[key].replace('/api', 'https://api.github.com')
  })
}

let axios = Axios.create({
  timeout: 10000
})

axios.interceptors.response.use(res => {
  return res.data
})

function getStars () {
  return axios.get(API.getStars)
}

function getDetail (owerName, repoName) {
  let url = `${API.getDetail}${owerName}/${repoName}`
  return axios.get(url)
}

export {
  getStars,
  getDetail
}
