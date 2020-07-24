import { Component, OnInit } from '@angular/core';
import { APIService } from './API.service';
import Amplify, { Auth } from 'aws-amplify';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from '../aws-exports';
import { listTodos } from './graphql/queries';
import gql from 'graphql-tag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'appsync-v1';
  todos: Array<any>;

  constructor(private apiService: APIService) {}

  getOIDCToken = async () =>
    await 'eyJraWQiOiI4WWhSaWRVRjUtNGpMVkFGVWw1V3ZIZU5ENUhGZXJPWDBxOEltY2hTUmZBIiwiYWxnIjoiUlMyNTYifQ.eyJydF9oYXNoIjoiekNRQjR6eW1FLW5QVlZYYUFKZEEzUSIsImlhdCI6MTU5NTYxMDU5MiwiaXNzIjoiaHR0cHM6Ly9zdGcwMDItd3d3LmVwb3N0LmNhL21nYS9zcHMvb2F1dGgvb2F1dGgyMC9tZXRhZGF0YS9jcGMtUk9QQyIsImF0X2hhc2giOiItTUNWNi1zVnp3eVpreXJUSGJXS3RRIiwic3ViIjoic2JzdGcybmFwcCIsImV4cCI6MTU5NTYxNzc5MiwiYXVkIjoiY3BjLVJPUEMtbW9iaWxlIn0.KC1HZcSyyL-8AMa9PxXyXnsXXKMXEjUn4Sv34ilX4DRdztZ_G3eeXmncntQBn226MpStxgbX7vxmW0O2BhOpf3RXmQ9XUy35aeJO3qz785axFlhU1eYK_VOPW-MMWc8CTxsaTxscO_LPjNyxoganKbiBwNnWdt9ERMCJJWd7zEuJOdCnGDZLa2tm6eSQui84FUNvsySw791e6uHCm0CK63z9u1wFR5jFToR9dkav76wTkbZd9zCoTWbybmL0gFL5WXvQMMrijhsm7C5s_nheth4JGL_R_xGa-4-Ux5o_85oez7826V9Wuttm6WVZfbUI9fgYLMcq47b06LSPJK08vQ'; // Should be an async function that handles token refresh

  client = new AWSAppSyncClient({
    url: awsconfig.aws_appsync_graphqlEndpoint,
    region: awsconfig.aws_appsync_region,
    auth: {
      type: AUTH_TYPE.OPENID_CONNECT,
      jwtToken: () => this.getOIDCToken(),
    },
  });

  async ngOnInit() {
    // this.apiService.ListTrackItems().then((evt) => {
    //   this.todos = evt.items;
    // });

    // this.apiService.OnCreateTrackItemListener.subscribe((evt) => {
    //   const data = (evt as any).value.data.onCreateTodo;
    //   this.todos = [...this.todos, data];
    // });

    this.client
      .query({
        query: gql(listTodos),
      })
      .then(({ data: { listTodos } }) => {
        console.log(listTodos.items);
      });
  }

  createTodo() {
    // this.apiService.CreateTrackItem({
    //   pin: 'Angular',
    //   description: 'testing',
    // });
  }
}
