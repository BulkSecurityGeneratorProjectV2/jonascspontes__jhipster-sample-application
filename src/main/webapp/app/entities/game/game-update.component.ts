import { Component, OnInit } from '@angular/core';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JhiAlertService, JhiDataUtils } from 'ng-jhipster';
import { IGame, Game } from 'app/shared/model/game.model';
import { GameService } from './game.service';
import { IGenero } from 'app/shared/model/genero.model';
import { GeneroService } from 'app/entities/genero';
import { IPlataforma } from 'app/shared/model/plataforma.model';
import { PlataformaService } from 'app/entities/plataforma';

@Component({
  selector: 'jhi-game-update',
  templateUrl: './game-update.component.html'
})
export class GameUpdateComponent implements OnInit {
  isSaving: boolean;

  generos: IGenero[];

  plataformas: IPlataforma[];

  editForm = this.fb.group({
    id: [],
    nome: [],
    ano: [],
    descricao: [],
    imagem: [],
    imagemContentType: [],
    link: []
  });

  constructor(
    protected dataUtils: JhiDataUtils,
    protected jhiAlertService: JhiAlertService,
    protected gameService: GameService,
    protected generoService: GeneroService,
    protected plataformaService: PlataformaService,
    protected activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.isSaving = false;
    this.activatedRoute.data.subscribe(({ game }) => {
      this.updateForm(game);
    });
    this.generoService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IGenero[]>) => mayBeOk.ok),
        map((response: HttpResponse<IGenero[]>) => response.body)
      )
      .subscribe((res: IGenero[]) => (this.generos = res), (res: HttpErrorResponse) => this.onError(res.message));
    this.plataformaService
      .query()
      .pipe(
        filter((mayBeOk: HttpResponse<IPlataforma[]>) => mayBeOk.ok),
        map((response: HttpResponse<IPlataforma[]>) => response.body)
      )
      .subscribe((res: IPlataforma[]) => (this.plataformas = res), (res: HttpErrorResponse) => this.onError(res.message));
  }

  updateForm(game: IGame) {
    this.editForm.patchValue({
      id: game.id,
      nome: game.nome,
      ano: game.ano,
      descricao: game.descricao,
      imagem: game.imagem,
      imagemContentType: game.imagemContentType,
      link: game.link
    });
  }

  byteSize(field) {
    return this.dataUtils.byteSize(field);
  }

  openFile(contentType, field) {
    return this.dataUtils.openFile(contentType, field);
  }

  setFileData(event, field: string, isImage) {
    return new Promise((resolve, reject) => {
      if (event && event.target && event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        if (isImage && !/^image\//.test(file.type)) {
          reject(`File was expected to be an image but was found to be ${file.type}`);
        } else {
          const filedContentType: string = field + 'ContentType';
          this.dataUtils.toBase64(file, base64Data => {
            this.editForm.patchValue({
              [field]: base64Data,
              [filedContentType]: file.type
            });
          });
        }
      } else {
        reject(`Base64 data was not set as file could not be extracted from passed parameter: ${event}`);
      }
    }).then(
      () => console.log('blob added'), // sucess
      this.onError
    );
  }

  previousState() {
    window.history.back();
  }

  save() {
    this.isSaving = true;
    const game = this.createFromForm();
    if (game.id !== undefined) {
      this.subscribeToSaveResponse(this.gameService.update(game));
    } else {
      this.subscribeToSaveResponse(this.gameService.create(game));
    }
  }

  private createFromForm(): IGame {
    return {
      ...new Game(),
      id: this.editForm.get(['id']).value,
      nome: this.editForm.get(['nome']).value,
      ano: this.editForm.get(['ano']).value,
      descricao: this.editForm.get(['descricao']).value,
      imagemContentType: this.editForm.get(['imagemContentType']).value,
      imagem: this.editForm.get(['imagem']).value,
      link: this.editForm.get(['link']).value
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IGame>>) {
    result.subscribe(() => this.onSaveSuccess(), () => this.onSaveError());
  }

  protected onSaveSuccess() {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError() {
    this.isSaving = false;
  }
  protected onError(errorMessage: string) {
    this.jhiAlertService.error(errorMessage, null, null);
  }

  trackGeneroById(index: number, item: IGenero) {
    return item.id;
  }

  trackPlataformaById(index: number, item: IPlataforma) {
    return item.id;
  }

  getSelected(selectedVals: Array<any>, option: any) {
    if (selectedVals) {
      for (let i = 0; i < selectedVals.length; i++) {
        if (option.id === selectedVals[i].id) {
          return selectedVals[i];
        }
      }
    }
    return option;
  }
}
