import React, { Component, useState, useRef } from 'react';
import styled from 'styled-components';
import { auth, firestore, uploadFile, deleteFile, tinyccApi } from '@firebase-api'
import uuid from 'react-uuid'
import { mixins, Main, theme } from '@styles';

import { 
  AppBar, 
  Box,
  Button, 
  CircularProgress,
  Dialog, 
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, 
  Fab, 
  IconButton, 
  Snackbar,
  Toolbar, 
  Typography 
} from '@material-ui/core';
import { CloudUpload, Delete, Edit, ExitToApp, Share } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';

import { DropzoneDialog } from 'material-ui-dropzone'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

const { colors } = theme;

const StyledContainer = styled(Main)`
  ${mixins.flexCenter};
  flex-direction: column;
`;

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function toClipboard(someText) {
  //This function copies some text into your clipboard.
  //It's an ugly workaround, because there's no built-in function in JS that does this job.
  var temp = document.createElement('input');
  document.body.appendChild(temp);
  temp.value = someText;
  temp.select();
  var res = document.execCommand('copy');
  document.body.removeChild(temp);
  console.log(res ? '"' + someText + 
    '" should have been copied to your clipboard' : 'Copying was not successful');
}


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
  },
  input: {
    display: 'none',
  },
  textarea: {
    display: 'none',
  },
  share: {
    position: 'absolute',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
  edit: {
    position: 'absolute',
    bottom: theme.spacing(2),
    left: theme.spacing(2),
  },
  delete: {
    marginRight: theme.spacing(2),
  },
  loading: {
    margin: 'auto'
  },
}));

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadDialog: false,
      uploading: false,
      deleteDialog: false,
      snackbar: false,
      loading: true,
      failed: false,
      photos: [],
      apiList: [],
      width: 800,
    };
    
    window.addEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.setState({
      width: window.innerWidth,
    })
  }

  componentDidMount() {
    this.handleResize();
    this.loadPhotos();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  async loadPhotos(reload) {
    const userId = auth.currentUser.uid;

    if(this.state.apiList.length === 0) { 
      console.log('init tinycc api');
      const tmp = await tinyccApi();
      this.setState({
        apiList: tmp
      });
    }

    if(this.state.photos.length === 0 || reload) {
      console.log('init photos');
      await firestore.collection(userId).get().then(snapshot => {
        const tmpPhotos = [];
        snapshot.forEach(doc => {
          let data = doc.data();
          console.log(data);
          tmpPhotos.push(new Photo({
            id: doc.id,
            ext: data.ext,
            link: data.link,
            shortlink: data.shortlink,
            hash: data.hash,
            api: data.api,
          }));
        });
        this.setState({
          photos: tmpPhotos,
        });
      }).finally(() => {
        this.finishLoading();
      });
    }
  }

  finishLoading() {
    this.setState({
      loading: false
    });
  }

  openUpload() {
    this.setState({
      uploadDialog: true,
    });
  }
  closeUpload() {
    this.setState({
      uploadDialog: false
    });
  }

  async handleSave(files) {
    this.setState({
      uploadDialog: false,
      loading: true,
      uploading: true,
    });
    let file = files[0];
    let filename = file.name;
    let upload = await uploadFile(file, uuid().replace("-", ""), filename.substring(filename.lastIndexOf('.')+1, filename.length) || filename, null, -1, this.state.apiList);

    if(!upload) {
      this.setState({
        failed: true
      });
    }

    this.loadPhotos(true);
    this.finishLoading();
    this.setState({
      snackbar: true,
      uploading: false,
    });
  }

  async handleDelete(photo) {
    this.setState({
      loading: true,
    });
    await deleteFile(photo.id, photo.ext, photo.hash, photo.api, this.state.apiList);
    
    const tmpPhotos = this.state.photos;
    const index = tmpPhotos.indexOf(photo);
    if (index > -1) {
      tmpPhotos.splice(index, 1);
    }
    this.setState({
      photos: tmpPhotos,
      loading: false,
    });
  }

  closeSnackbar() {
    this.setState({
      snackbar: false,
    });
  }

  render() {
    const classes = this.props.classes;

    return (
      <div className={classes.root}>
        <AppBar position="fixed" style={{ background: colors.background }}>
          <Toolbar>
            <IconButton onClick={() => {
              auth.signOut();
            }} >
              <ExitToApp />
            </IconButton>
            <Typography variant="h6">
              {`Signed in as ${auth.currentUser.email}`}
            </Typography>
          </Toolbar>
        </AppBar>

        <Box
          style={{
            paddingTop: 64
          }}
        >
          {this.state.photos.length !== 0 && !this.state.loading && (
            <ResponsiveMasonry columnsCountBreakPoints={{349: 1, 699: 2, 1049: 3, 1399: 4}}>
              <Masonry>
                {this.state.photos.map((photo, i) => {
                  return (
                    <PhotoTile 
                      key={uuid()} 
                      photo={photo} 
                      classes={classes} 
                      width={this.state.width} 
                      handleDelete={this.handleDelete.bind(this)} 
                      apiList={this.state.apiList}
                    />
                  )}
                )}
              </Masonry>
            </ResponsiveMasonry>
          )}
          {this.state.loading && (
            <StyledContainer>
              <CircularProgress styles={{
                color: colors.accent
              }} />
              <Typography variant="h6">
                {this.state.uploading ? 'Uploading...' : 'Loading...'}
              </Typography>
            </StyledContainer>
          )}
          {this.state.photos.length === 0 && !this.state.loading && (
            <StyledContainer>
              <Typography variant="h6">
                {'No photos yet...'}
              </Typography>
              <Typography variant="h6">
                {'Click on the Add Photos button to add a photo. '}
              </Typography>
            </StyledContainer>
          )}
        </Box>

        <Fab 
          className={classes.fab}
          variant="extended"
          onClick={this.openUpload.bind(this)}
        >
          <CloudUpload className={classes.extendedIcon} />
          Add Photo
        </Fab>

        <DropzoneDialog
          open={this.state.uploadDialog}
          onSave={this.handleSave.bind(this)}
          acceptedFiles={['image/*']}
          showPreviews={true}
          maxFileSize={500000}
          filesLimit={1}
          onClose={this.closeUpload.bind(this)}
        />

        <Snackbar open={this.state.snackbar && !this.state.failed} autoHideDuration={6000} onClose={this.closeSnackbar.bind(this)}>
          <Alert onClose={this.closeSnackbar.bind(this)} severity="success">
            Uploaded files Click on the share icon to get the generated link. 
          </Alert>
        </Snackbar>
        <Snackbar open={this.state.snackbar && this.state.failed} autoHideDuration={6000} onClose={this.closeSnackbar.bind(this)}>
          <Alert onClose={this.closeSnackbar.bind(this)} severity="error">
            File failed to upload.
          </Alert>
        </Snackbar>
      </div>
    );
  }
}
 
export default () => {
  const classes = useStyles();
  return (
    <MainPage classes={classes} />
  )
}

class Photo {
  constructor(props) {
    this.link = props.link;
    this.shortlink = props.shortlink;
    this.ext = props.ext;
    this.hash = props.hash;
    this.api = props.api;

    this.id = props.id;
  }

  async handleEdit(files, apiList) {
    let file = files[0];
    let result = await uploadFile(file, this.id, this.ext, this.hash, this.api, apiList);
    return result;
  }
}

const PhotoTile = (props) => {
  const [edit, setEdit] = useState(false);
  const [edited, setEdited] = useState(false);

  const [share, setShare] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shortlink, setShortlink] = useState(false);
  
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [failed, setFailed] = useState(false);
  const textAreaRef = useRef(null);
  
  const photo = props.photo;
  const classes = props.classes;

  const shareLink = (e) => {
    toClipboard(photo.shortlink.length !== 0 ? photo.shortlink : photo.link);
    setShare(true);
    setShortlink(photo.shortlink.length !== 0);
  }

  const save = async (files) => {
    setEdit(false);
    setLoading(true);
    await photo.handleEdit(files, props.apiList)
    .then(async (result) => {
      if(result) {
        console.log('Done replacing file');
        const userId = auth.currentUser.uid;
        await firestore.collection(userId).doc(photo.id).get().then(doc => {
          const data = doc.data();
          photo.link = data.link;
        });
      } else {
        console.error('Failed to replace file.')
        setFailed(true);
      }
    })
    .finally(() => {
      setLoading(false);
      setEdited(true);
    });
  }

  return (
    <div 
      key={photo.id}
      style={{
        width: `${Math.floor(props.width/350) > 4 ? props.width/4 : 350 + (props.width % 350)/(Math.floor(props.width/350))}px`,
        position: 'relative'
      }}
    >
      {!loading && (
        <div>
          <img 
            src={photo.link}
            alt={photo.link} 
          />
          <IconButton 
            style={{ 
              color: colors.accent,
              background: colors.background,
            }} 
            className={classes.edit} 
            onClick={() => setEdit(true)}
          >
            <Edit />
          </IconButton>   
          <div
            style={{
              flexDirection: 'row'
            }}
            className={classes.share} 
          > 
            <IconButton 
              style={{ 
                color: colors.accent,
                background: colors.background,
              }}
              className={classes.delete}
              onClick={() => setDeleteDialog(true)}
            >
              <Delete />
            </IconButton>
            <IconButton 
              style={{ 
                color: colors.accent,
                background: colors.background,
              }} 
              onClick={shareLink}
            >
              <Share />
            </IconButton>
          </div>
        </div>
      )}

      {loading && (
        <CircularProgress className={classes.loading} />
      )}

      <DropzoneDialog
        open={edit}
        onSave={(files) => save(files)}
        acceptedFiles={[`image/${photo.ext}`]}
        showPreviews={true}
        maxFileSize={500000}
        filesLimit={1}
        onClose={() => setEdit(false)}
      />

      <textarea ref={textAreaRef} className={classes.textarea} value={photo.link} readOnly={true}/>

      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
      >
        <DialogTitle id="delete-dialog-title">{"Delete Photo?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            This photo will be permanently deleted, and the link will no longer be valid.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={async () => {
            setDeleteDialog(false);
            await props.handleDelete(photo);
            setDeleted(true);
          }} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>


      <Snackbar open={share && shortlink} autoHideDuration={6000} onClose={() => {setShare(false); setShortlink(false)}}>
        <Alert onClose={() => {setShare(false); setShortlink(false)}} severity="success">
          Copied shortlink to clipboard!
        </Alert>
      </Snackbar>
      <Snackbar open={share && !shortlink} autoHideDuration={6000} onClose={() => {setShare(false); setShortlink(false)}}>
        <Alert onClose={() => {setShare(false); setShortlink(false)}} severity="info">
          Copied link to clipboard! A shortlink was not be generated for this file. 
        </Alert>
      </Snackbar>
      <Snackbar open={edited && !failed} autoHideDuration={6000} onClose={() => setEdited(false)}>
        <Alert onClose={() => setEdited(false)} severity="info">
          Photo successfully edited!
        </Alert>
      </Snackbar>
      <Snackbar open={edited && failed} autoHideDuration={6000} onClose={() => {setEdited(false); setFailed(false)}}>
        <Alert onClose={() => {setEdited(false); setFailed(false)}} severity="error">
          Photo failed to be edited.
        </Alert>
      </Snackbar>
      <Snackbar open={deleted} autoHideDuration={6000} onClose={() => setDeleted(false)}>
        <Alert onClose={() => setDeleted(false)} severity="warning">
          Photo successfully deleted.
        </Alert>
      </Snackbar>
    </div>
  )
}