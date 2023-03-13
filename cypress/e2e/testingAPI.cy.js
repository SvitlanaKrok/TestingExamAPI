///<reference types="cypress"/>
import { faker } from '@faker-js/faker';
import * as user from '../fixtures/user.json';

user.email = faker.internet.email();
user.password = faker.internet.password(15);


describe('Post suite', () => {

  it('Get all posts', () => {
    cy.log('Get all posts')
    cy.request('GET', '/posts').then(response => {
      console.log(response);

      expect(response.status).to.be.equal(200);
      expect(response.headers['content-type']).to.contain('application/json');
    })
  })

  it('Get only first 10 posts', () => {
    cy.log('Get 10 posts')
    cy.request('GET', '/posts?_page=1&_limit=10').then(response => {
      console.log(response);

      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.length(10);
    })
  })

  it('Get posts with id = 55 and id = 60', () => {
    cy.log('Get posts with id')
    cy.request('GET', '/posts?id=55&id=60').then(response => {
      console.log(response);

      expect(response.status).to.be.equal(200);
      expect(response.body).to.have.length(2);
      let postIds = response.body.map(post => post.id)
      expect(postIds).to.include(55);
      expect(postIds).to.include(60);
    })
  })

  it('Create an unauthorized post', () => {
    cy.log('Create a post')
    cy.request({
      method: 'POST',
      url: '/664/posts',
      failOnStatusCode: false
    }).then(response => {
      console.log(response);

      expect(response.status).to.be.equal(401);
    })
  })

  it('Create an authorized post', () => {
    cy.log('Register a user')

    cy.request('POST', '/register', user).then(registerResponse => {
      console.log("Register response:");
      console.log(registerResponse);

      expect(registerResponse.status).to.be.equal(201);
      expect(registerResponse.body.user.email).to.be.equal(user.email);

      cy.log('Login a user')

      cy.request('POST', '/login', user).then(loginResponse => {
        console.log("Login response:");
        console.log(loginResponse);

        expect(loginResponse.status).to.be.equal(200);

        cy.request({
          method: 'POST',
          url: '/664/posts',
          headers: {
            "Authorization": "Bearer " + loginResponse.body.accessToken
          }, failOnStatusCode: false
        }).then(postPesponse => {
          console.log("Post response:");
          console.log(postPesponse);

          expect(postPesponse.status).to.be.equal(201);
        })
      })
    })
  })

  it('Create post entity', () => {
    cy.log('Create post entity')
    let params = {
      post: 'Azure Active Directory Authentication',
      comment: 'Log in to Azure Active Directory'
    }
    cy.request({
      method: 'POST',
      url: '/posts',
      body: params,
      form: true
    }).then(response => {
      console.log("Create response:");
      console.log(response);

      expect(response.status).to.be.equal(201);
      expect(response.body.post).to.be.equal(params.post);
      expect(response.body.comment).to.be.equal(params.comment);
    })
  })

  it('Update non-existing entity', () => {
    cy.log('Update non-existing entity')
    let params = {
      post: 'Azure Active Directory Authentication',
      comment: 'Log in to Azure Active Directory',
      stars: 5
    }
    cy.request({
      method: 'PUT',
      url: '/posts/999999999',
      body: params,
      failOnStatusCode: false
    }).then(response => {
      console.log("Update response:");
      console.log(response);

      expect(response.status).to.be.equal(404);
    })
  })

  it('Create post entity and update entity', () => {
    cy.log('Create post entity')
    let params = {
      post: 'Azure Active',
      comment: 'Log in to Azure Active Directory',
      stars: 5
    }
    cy.request({
      method: 'POST',
      url: '/posts',
      body: params
    }).then(createResponse => {
      console.log("Create response:");
      console.log(createResponse);

      expect(createResponse.status).to.be.equal(201);

      cy.log('Update existing entity')
      cy.request({
        method: 'PUT',
        url: '/posts/' + createResponse.body.id,
        body: { stars: 10 },
        failOnStatusCode: false
      }).then(response => {
        console.log("Update response:");
        console.log(response);

        expect(response.status).to.be.equal(200);
        //expect(response.body.comment).to.be.equal(params.stars);
      })
    })
  })

  it('Delete non-existing entity', () => {
    cy.log('Update non-existing entity')
    let params = {
      post: 'Azure Active Directory Authentication',
      comment: 'Log in to Azure Active Directory',
      stars: 5,
      photo: 'img'

    }
    cy.request({
      method: 'DELETE',
      url: '/posts/99999999',
      body: params,
      failOnStatusCode: false
    }).then(response => {
      console.log(response);

      expect(response.status).to.be.equal(404);
    })
  })

  it('Create, update and delete entity post', () => {
    cy.log('Create post entity')
    let params = {
      post: 'Azure Active',
      comment: 'Log in to Azure Active Directory',
      stars: 5
    }
    cy.request({
      method: 'POST',
      url: '/posts',
      body: params
    }).then(createResponse => {
      console.log("Create response:");
      console.log(createResponse);

      expect(createResponse.status).to.be.equal(201);

      cy.log('Update existing entity')
      cy.request({
        method: 'PUT',
        url: '/posts/' + createResponse.body.id,
        body: { stars: 10 },
        failOnStatusCode: false
      }).then(Updateresponse => {
        console.log("Update response:");
        console.log(Updateresponse);

        expect(Updateresponse.status).to.be.equal(200);

        cy.log('Delete existing entity')
        cy.request({
          method: 'DELETE',
          url: '/posts/' + createResponse.body.id,
          body: params,
          failOnStatusCode: false
        }).then(deleteResponse => {
          console.log("Delete response:");
          console.log(deleteResponse);

          expect(deleteResponse.status).to.be.equal(200);
        })

        cy.request({
          method: 'GET',
          url: '/posts/' + createResponse.body.id,
          failOnStatusCode: false
        }).then(response => {
          console.log(response);

          expect(response.status).to.be.equal(404);
        })
      })
    })
  })
})


