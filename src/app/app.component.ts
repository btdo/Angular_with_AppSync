import { Component, OnInit } from '@angular/core';
import { APIService } from './API.service';
import Amplify, { Auth } from 'aws-amplify';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from '../aws-exports';
import gql from 'graphql-tag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'appsync-v1';
  todos: Array<any>;

  // We use the gql tag to parse our query string into a query document

  constructor(private apiService: APIService) {}

  getOIDCToken = async () =>
    await 'eyJraWQiOiI4WWhSaWRVRjUtNGpMVkFGVWw1V3ZIZU5ENUhGZXJPWDBxOEltY2hTUmZBIiwiYWxnIjoiUlMyNTYifQ.eyJydF9oYXNoIjoiY01OVWE3bU5XZ05odFJ4bm5uVXcwUSIsImlhdCI6MTU5NTc3MTU4OSwiaXNzIjoiaHR0cHM6Ly9zdGcwMDItd3d3LmVwb3N0LmNhL21nYS9zcHMvb2F1dGgvb2F1dGgyMC9tZXRhZGF0YS9jcGMtUk9QQyIsImF0X2hhc2giOiJvdV9hak4ta0dlUGVHeTBtWVBVZ0lnIiwic3ViIjoic2JzdGcybmFwcCIsImV4cCI6MTU5NTc3ODc4OSwiYXVkIjoiY3BjLVJPUEMtbW9iaWxlIn0.WtLRXKKst_TrZqX2nen41oGs5vP30H6IdCADd2JL_o3zHM454G6fKkzQedb73vP6wkfuk9EDIPIh1GpkS8BsG9OTSwVlnuptFfGusGjSbQQzD62SlghuEmRwKlmHreHUs_qnzLe7wFMSfrdQoJThgAriY9zo2tMMq-KqlQlS0dU4esMhziR0VmBkqgi48RYAPY83ZwGVFaFF7hrCcuEyeNqIUNwUUrWdot3KIdXkOJ4vwDbBPpr9uknBYEnPO6_I7m8dIByqThXLMeVMIMbDbx7wGlLi_stlQSEwwJuTBeP81j04Kyd_gR08sKWnZzEuWK1Bl5_M6Z1OcTHYwzRCkQ'; // Should be an async function that handles token refresh

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

    const ListTrackItem = gql`
      query {
        listTrackItems {
          items {
            id
            pin
            description
          }
        }
      }
    `;

    this.client
      .query({
        query: ListTrackItem,
      })
      .then((evt) => {
        console.log(evt);
        this.todos = evt.data.listTrackItems.items;
      });
  }

  createTodo() {
    // this.apiService.CreateTrackItem({
    //   pin: 'Angular',
    //   description: 'testing',
    // });

    const createItemQuery = gql`
      mutation createTrackItem($pin: String!, $description: String!) {
        createTrackItem(input: { pin: $pin, description: $description }) {
          id
          pin
          description
        }
      }
    `;

    const createItem = (async () => {
      const result = await this.client.mutate({
        mutation: createItemQuery,
        variables: {
          pin: '1231231232',
          description: 'angular',
        },
      });
      console.log(result.data.createTodo);
    })();
  }
}
