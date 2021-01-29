import React from 'react';
import PropTypes from 'prop-types';

const RepoInfo = ({name, sshUrl, language}) => {
return(<div className="repo-container">
    <div className="repo-name">Repo name: {name}</div>
    <div className="repo-language">language: {language}</div>
    <div className="repo-url">Clone by ssh: {sshUrl}</div>
</div>)
}

RepoInfo.propTypes = {
    name: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    sshUrl: PropTypes.string.isRequired
}

export default RepoInfo;