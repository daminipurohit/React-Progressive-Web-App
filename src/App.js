import React, {useState} from 'react';
import API from './utils/api.js';
import RepoInfo from './RepoInfo';

const fetchGithubRepos = async (q)=>{
    try {
        const data = await API.get(`users/${q}/repos`)
        return data;
    } catch (err) {
        if(err.message === 'Network Error') {
            return {status: 500}
        }
        // fails for 404
        return {status:404}
    }
}
const App = () => {
    const [query, setQuery] = useState('');
    const [user, setUser] = useState([]);
    const [fallbackUI, setFallbackUI] = useState(false)
    const [noResource, setNoResource] = useState(false)
    const [err, setErr] = useState(false)

    const handleQuery = e => setQuery(e.target.value);

    const search = async (e) => {
        if(e.key=== 'Enter'){
            try {
            const data = await fetchGithubRepos(query);
            if(data.status && data.status === 404) {
                setNoResource(true)
                setErr(false)
                return;
            }
            if(!data.data || (data.status && data.status === 500)){
                setFallbackUI(true)
                setErr(false)
                return;
            }
            setErr(false)
            setFallbackUI(false)
            setNoResource(false)
            setUser(data.data);
            } catch {
                setErr(true)
            }
        }
    }
    return(
        fallbackUI ? <div>Please go online to check details</div>
        : (
            <div className="main-container"> 
            Search github username for getting their repos :
            <input type="text" className="search"
            onChange={handleQuery} value={query} placeholder="Search..."
            onKeyPress={search} />
            {noResource?<div>No resource found, please choose correct username</div>:
            err ? <div>Network error, try again.</div> :
            user.map(({id, name, ssh_url, language}) => {
                return(<RepoInfo key={id} name={name}
                    sshUrl={ssh_url} language={language} />)
            })}
            </div>
            )
    )
}
export default App;