import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { HeroInterface } from '../interfaces/hero.interface';
import { environments } from 'src/app/environments/environments';

import { AllHeroesInterface } from '../interfaces/allHeroes.interface';
import { CreateHeroResInterface } from '../interfaces/createHeroRes.interface';
import { GetHeroResInterface } from '../interfaces/getHeroRes.interface';
import { UpdateHeroResInterface } from '../interfaces/updateHeroRes.interface';
import { SearchResInterface } from '../interfaces/searchRes.interface';

@Injectable({
  providedIn: 'root',
})
export class HeroesService {
  private baseUrl: string = environments.baseUrl;
  private http = inject(HttpClient);

  // * IMPORTANT: in order for this to work, _id must also be part of myForm, but when sending current hero as argument for the updateCharacter or any other CRUD method, we cannot send current hero with id included, because that id is not part of the body(backend creates an automatic mongoid once the hero has been created), and it will give you the error you where trying to solve for a while. that is why on heroes service i also created a body with all properties except for the _id one.
  heroWithOutIdProp(hero: HeroInterface) {
    return {
      superhero: hero.superhero,
      publisher: hero.publisher,
      alterEgo: hero.alterEgo,
      firstAppearance: hero.firstAppearance,
      characters: hero.characters,
      photo: hero.photo,
    };
  }

  getHeroes(): Observable<HeroInterface[]> {
    return this.http
      .get<AllHeroesInterface>(`${this.baseUrl}/api/heroes/allHeroes`)
      .pipe(
        map((res) => {
          return res.foundHeroes;
        })
      );
  }

  getHeroById(id: string): Observable<HeroInterface | undefined> {
    return this.http
      .get<GetHeroResInterface>(`${this.baseUrl}/api/heroes/hero/${id}`)
      .pipe(
        map((res) => {
          return res.userFound;
        }),
        // * if invalid id, then that would return to us the assigned error from the backend. but we need to  return  an observable, therefore:
        catchError((err) => {
          return of(undefined);
        })
      );
  }

  getHeroesByLetter(letter: string): Observable<HeroInterface[]> {
    return this.http
      .get<SearchResInterface>(`${this.baseUrl}/api/heroes/search/${letter}`)
      .pipe(
        map((res) => {
          return res.foundHeroes;
        })
      );
  }

  addCharacter(hero: HeroInterface): Observable<HeroInterface> {
    // * , hero will act as my Body (think of postman!!).
    return this.http
      .post<CreateHeroResInterface>(
        `${this.baseUrl}/api/heroes/createHero`,
        this.heroWithOutIdProp(hero)
      )
      .pipe(
        map((res) => {
          return res.savedHero;
        })
      );
  }

  updateCharacter(hero: HeroInterface): Observable<HeroInterface> {
    if (!hero.id) {
      throw Error('hero name is required...');
    }

    // * , hero will act as my Body (think of postman!!).
    return this.http
      .patch<UpdateHeroResInterface>(
        `${this.baseUrl}/api/heroes/hero/${hero.id}`,
        this.heroWithOutIdProp(hero)
      )
      .pipe(
        map((res) => {
          return res.updatedHero;
        })
      );
  }

  deleteCharacter(superheroName: string): Observable<boolean> {
    // * , hero will act as my Body (think of postman!!).
    return this.http
      .delete(`${this.baseUrl}/api/heroes/hero/${superheroName}`)
      .pipe(
        map((res) => {
          return true;
        }),
        catchError(() => {
          return of(false);
        })
      );
  }
}
