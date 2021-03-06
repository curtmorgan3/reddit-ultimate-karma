import React, { Component } from 'react';
import ViewController from './Components/ViewController';
import {getPosts, authorize, getUserData, loggedIn, login, refreshToken} from './services/api-helpers.js'
import {calculateAverage, findBestTime} from './services/calculations.js'
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentView: '',
      currentSearch: '',
      currentSub: '',
      posts: [],
      average: [],
      bestTime: [],
      loggedIn: false,
      userAccessToken: '',
      currentUserName: '',
      stagedPosts: []
    }
    //bindings
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.setView = this.setView.bind(this);
    this.handleStagedPosts = this.handleStagedPosts.bind(this);
    this.deleteStagedPost = this.deleteStagedPost.bind(this);
  }

  async componentDidMount(){
    const code = await loggedIn();
    if(code){
      this.setState({
        loggedIn: true,
        currentView: 'loggedIn'
      })
      const userAuth = await authorize(code);
      await this.setState({
        userAccessToken: userAuth.data.access_token,
        userRefreshToken: userAuth.data.refresh_token
      })
      const currentUser = await getUserData(this.state.userAccessToken, this.state.refresh_token)
      this.setState({
        currentUserName: currentUser.data.name,
        currentUser: currentUser.data
      })
      setInterval(refreshToken(), 36000000)
    }else{
      this.setState({
        loggedIn: false
      })
    }

  }
  //***********View Controllers************
  setView(view){
    this.setState({
      currentView: view,
      posts: []
    })
  }

  handleChange(evt){
    this.setState({
      [evt.target.name]: evt.target.value
    })
  }

  async handleSubmit(evt){
    evt.preventDefault();
    await this.setState({
      currentView: 'viewSub',
      currentSub: this.state.currentSearch,
      currentSearch: ''
    })
    try{
      const posts = await getPosts(this.state.currentSub);
      await this.setState({
        posts: posts
      })
    }catch(error){
      this.setState({
        currentView: 'error'
      })
    }
    const average = await calculateAverage(this.state.posts);
    await this.setState({
      average: average
    })
    const bestTime = await findBestTime(this.state.average);
    await this.setState({
      bestTime: bestTime
    })
  }
//******************************************

  async handleLogin(){
    await login();

  }

  handleStagedPosts(posts){
    this.setState({
      stagedPosts: [...this.state.stagedPosts, posts]
    })
  }
  deleteStagedPost(postTitle){
    console.log('delete post');
    const stagedPosts = this.state.stagedPosts.filter(post =>
      post.title !== postTitle
    )
    this.setState({
      stagedPosts: stagedPosts
    })
  }
  render() {
    return (
      <div className="App">

        <ViewController state={this.state}
                        handleChange={this.handleChange}
                        handleSubmit={this.handleSubmit}
                        handleLogin={this.handleLogin}
                        handleStagedPosts={this.handleStagedPosts}
                        setView={this.setView}
                        deleteStagedPost={this.deleteStagedPost}
        />
      </div>
    );
  }
}

export default App;
