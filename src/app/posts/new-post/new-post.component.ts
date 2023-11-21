import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriesService } from './../../services/categories.service';
import { Component, OnInit } from '@angular/core';
import { Post } from 'src/app/models/post';
import { PostsService } from 'src/app/services/posts.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css']
})
export class NewPostComponent implements OnInit {

  permalink: string = '';
  imgSrc: any = '../../../assets/placeholder-image.png';
  selectedImg: any;

  categories: Array<object>;

  postForm: FormGroup;

  post: any;

  formStatus: string = 'Add New';

  docId: string;

  constructor(
    private categoriesService:CategoriesService,
    private fb: FormBuilder,
    private postService: PostsService,
    private route: ActivatedRoute
    ) {
    this.route.queryParams.subscribe(val=>{

      this.docId = val.id;

      if(this.docId){
        this.postService.loadOneData(val.id).subscribe(post=>{
          // console.log(post);
          this.post = post;
          this.postForm = this.fb.group({
            title: [this.post.title,[Validators.required, Validators.minLength(10)]],
            permalink:[this.post.permalink, Validators.required],
            except:[this.post.except, [Validators.required, Validators.minLength(50)]],
            category:[`${this.post.category.categoryId}-${this.post.category.category}`, Validators.required],
            postImg:['', Validators.required],
            content:[this.post.content, Validators.required],
          })
          this.imgSrc = this.post.postImgPath;
          this.formStatus = 'Edit';
        });
      }else{
        this.postForm = this.fb.group({
          title: ['',[Validators.required, Validators.minLength(10)]],
          permalink:['', Validators.required],
          except:['', [Validators.required, Validators.minLength(50)]],
          category:['', Validators.required],
          postImg:['', Validators.required],
          content:['', Validators.required],
        })
      }
    })
    this.postForm = this.fb.group({
      title: ['',[Validators.required, Validators.minLength(10)]],
      permalink:['', Validators.required],
      except:['', [Validators.required, Validators.minLength(50)]],
      category:['', Validators.required],
      postImg:['', Validators.required],
      content:['', Validators.required],
    })
   }

  ngOnInit(): void {
    this.categoriesService.loadData().subscribe(val=>{
      this.categories = val;
      console.log(val);
    });
  }

  get fc(){
    return this.postForm.controls;
  }



  onTitleChanged($event){
    const title = $event.target.value;
    this.permalink =  title.replace(/\s/g, '-');

  }

  showPreview($event){
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imgSrc = e.target.result;
    }

    reader.readAsDataURL($event.target.files[0]);
    this.selectedImg = $event.target.files[0];
  }

  onSubmit(){

    console.log(this.postForm.value);
    let splitted =  this.postForm.value.category.split('-')
    console.log(splitted);

    const postData: Post = {
      title: this.postForm.value.title,
      permalink: this.postForm.value.permalink,
      category:{
        categoryId: splitted[0],
        category: splitted[1]
      },
      postImgPath: '',
      except: this.postForm.value.except,
      content: this.postForm.value.content,
      isFeatured: false,
      views: 0,
      status: 'new',
      createdAt: new Date()
    }

    this.postService.uploadImg(this.selectedImg, postData,this.formStatus, this.docId );
    this.postForm.reset();
    this.imgSrc = '../../../assets/placeholder-image.png';
  }
}
