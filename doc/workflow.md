# Git workflow

We are **strictly** using forking workflow to manage this software repository. Please see [the tutorial](https://www.atlassian.com/git/tutorials/comparing-workflows#forking-workflow) by Atlassian about this schema.

The *official repository* contains a single protected `master` branch. The `master` branch is always deployable snapshot. The developers forks the official repository, makes a feature branches at own fork. To integrate the feature into the official code base, the developer opens a pull request against the official repository. The sanity check of the pull request is automatically executed by CI/CD (unit tests, integration tests, code coverage, style check, etc). The repository maintainer merges the pull request when CI/CD accepts the PR. The merge of pull request triggers the deployment into development environment. The tagging of master branch triggers deployment of artifact to production environment.
 

The work flow is illustrated on the following diagram

```
Official Repository                                           tag
                                                 merge       x.x.x
  master  -----------------------------------------*-----------*--------------
           \                                      / \           \
            \                          check     /   \  build    \  carry
             \ fork                   *~~~*~*~*~~~~~~~*~~~~~~*~~~~*~~~~~~~*~~ CI/CD
Developer     \                      /   / / /               |            |
               \            open PR /   / / /                |            |
  master  ------*------------------/---/-/-/-----------------|------------|--
                   \              /   / / /                  |            |
                    \            /   / / /                   |            |
featureA  -----------*---*-*-*--/---/-/-/--------------------|------------|--
                        / / /      fixes                     |            |
featureB  -------------/-/-/---------------------------------|------------|--
                      / / /                                  |            |
                     commits                                 V            V
                                                           to stg      to live
```


### Commit messages 

The commit message helps us to write a good release note, speed-up review process. The message should address two question what changed and why. The project follows the template defined by chapter [Contributing to a Project](http://git-scm.com/book/ch5-2.html) of Git book.  

>
> Short (50 chars or less) summary of changes
>
> More detailed explanatory text, if necessary. Wrap it to about 72 characters or so. In some contexts, the first line is treated as the subject of an email and the rest of the text as the body. The blank line separating the summary from the body is critical (unless you omit the body entirely); tools like rebase can get confused if you run the two together.
> 
> Further paragraphs come after blank lines.
> 
> Bullet points are okay, too
> 
> Typically a hyphen or asterisk is used for the bullet, preceded by a single space, with blank lines in between, but conventions vary here
>
>

### Pull requests

The pull request is revertible delivery. It's scope shall concern a single feature only (a few hours of work). The giant pull requests that scopes multiple files and represents a few days of works are not accepted.

