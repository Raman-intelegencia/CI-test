import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConversationListsComponent } from './conversation-lists/conversation-lists.component';
import { ConversationListsDetailComponent } from './conversation-lists-detail/conversation-lists-detail.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: "inbox",
    pathMatch: "full",
  },
  {
    path: 'inbox',
    component: ConversationListsComponent,
    children: [
      {
        path: 'thread/:threadId',
        component: ConversationListsDetailComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesRoutingModule { }
