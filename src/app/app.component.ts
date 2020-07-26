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
    await 'eyJraWQiOiI4WWhSaWRVRjUtNGpMVkFGVWw1V3ZIZU5ENUhGZXJPWDBxOEltY2hTUmZBIiwiYWxnIjoiUlMyNTYifQ.eyJydF9oYXNoIjoiOVd4N1BrZHFhTXhrc1dXUjV6QTZzZyIsImlhdCI6MTU5NTc5MTEwNCwiaXNzIjoiaHR0cHM6Ly9zdGcwMDItd3d3LmVwb3N0LmNhL21nYS9zcHMvb2F1dGgvb2F1dGgyMC9tZXRhZGF0YS9jcGMtUk9QQyIsImF0X2hhc2giOiJnQzVEUlZDbkpQOTZNb2hxTnFSWi1nIiwic3ViIjoic2JzdGcybmFwcCIsImV4cCI6MTU5NTc5ODMwNCwiYXVkIjoiY3BjLVJPUEMtbW9iaWxlIn0.fnF37_k6QZ62m1BYdH1faIwnkDpc2tiwzAx69tc724LyqWRp7mRgYpxZ4aFyjj0nWinqokThN10f6rXHtS_o6ZKik5Ml-gTaczxkFtmx0WqIGP5QxsYLnKVwYI1FdtRe7qsGMRbo8r5honl00DC9h5OC8m93QGKsmwUhubY_NworgS3RR5JIvqQcch1Tfez_DDUuQhgLxY4XM9JohjIHPRJrBGDHJG2QUIhrjdDer1hdm4mJ2dq3sbAxIBYMtt31TNaWaxb6qiyutfJbr8CPhsM-5pMruwJ3ICrfANkMbKErzxSns-FTBsl8QdbE-fO0Ub8vrNm5h5OZqMQxzYd9vg'; // Should be an async function that handles token refresh

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
      query ListTrackItems(
        $filter: ModelTrackItemFilterInput
        $limit: Int
        $nextToken: String
      ) {
        listTrackItems(filter: $filter, limit: $limit, nextToken: $nextToken) {
          items {
            id
            pin
            description
            type
            owner
            createdAt
            _version
            _deleted
            _lastChangedAt
            updatedAt
          }
          nextToken
          startedAt
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

    this.subscribeTodo();
    this.updateTodo();
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
          type
          owner
          createdAt
          _version
          _deleted
          _lastChangedAt
          updatedAt
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
      console.log('item created ' + JSON.stringify(result.data));
    })();
  }

  updateTodo() {
    const updateItemQuery = gql`
      mutation UpdateTrackItem(
        $input: UpdateTrackItemInput!
        $condition: ModelTrackItemConditionInput
      ) {
        updateTrackItem(input: $input, condition: $condition) {
          id
          pin
          description
          type
          owner
          createdAt
          _version
          _deleted
          _lastChangedAt
          updatedAt
        }
      }
    `;

    const updateItem = (async () => {
      const result = await this.client.mutate({
        mutation: updateItemQuery,
        variables: {
          input: {
            id: '17602d8d-9b27-47a4-beb7-cb08641f5a39',
            pin: '1231232',
            description: 'updated description',
          },
        },
      });
      console.log('item updated ' + JSON.stringify(result.data));
    })();
  }

  subscribeTodo() {
    const subscribeToDo = gql`
      subscription OnCreateTrackItem($owner: String!) {
        onCreateTrackItem(owner: $owner) {
          id
          pin
          description
          type
          owner
          createdAt
          _version
          _deleted
          _lastChangedAt
          updatedAt
        }
      }
    `;

    let subscription;

    console.log('subscribing');
    (async () => {
      subscription = this.client
        .subscribe({
          query: subscribeToDo,
          variables: {
            owner: 'sbstg2napp',
          },
        })
        .subscribe({
          next: (data) => {
            console.log('created listener ' + data);
          },
          error: (error) => {
            console.warn(error);
          },
        });
    })();

    // Unsubscribe after 10 secs
    setTimeout(() => {
      subscription.unsubscribe();
    }, 10000);
  }
}
