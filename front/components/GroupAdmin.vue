<template>
  <div>
    <el-container direction="vertical">
      <el-row>
        <el-col
          class="title"
          :md="{span: 8}"
          :sm="{span: 8}"
          :xs="{span: 8}"
        >{{ groupAdministrationTrans[lang] }}</el-col>
        <el-col
          class="subtitle"
          :md="{span: 16}"
          :sm="{span: 16}"
          :xs="{span: 16}"
        >{{ groupNameTrans[lang] }}</el-col>
      </el-row>
      <el-card
        style="margin-top: 4%"
        :md="{span: 8, offset: 8}"
        :sm="{span: 8, offset: 8}"
        :xs="{span: 8, offset: 8}"
      >
        <el-container>
          <el-header class="smalltitle" align="center">{{ additionTitleTrans[lang] }}</el-header>
          <el-main>
            <el-table
              ref="pendingTable"
              style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              :data="listViewPending"
              border
              striped
              align="center"
              @select="handleSelectionPending"
            >
              <el-table-column type="selection" align="center"></el-table-column>
              <el-table-column type="index" width="80" :index="indexMethod" align="center"></el-table-column>
              <el-table-column
                prop="studentNumber"
                label="Student Number"
                align="center"
              ></el-table-column>
              <el-table-column prop="name" label="Name" align="center">
              </el-table-column>
            </el-table>
            <el-pagination
              @current-change="handlePagePending"
              :current-page.sync="currentPagePending"
              :page-size="20"
              layout="prev, pager, next, jumper"
              :total="totalPendingSize"
            ></el-pagination>
          </el-main>
          <el-footer style="margin-top: 20px" align="center">
            <el-button @click="permit">{{ additionTrans[lang] }}</el-button>
            <el-button @click="reject">{{ rejectTrans[lang] }}</el-button>
            <el-button @click="toggleShowSelectedPending">{{ toggleShowSelectedTrans[lang] }}</el-button>
          </el-footer>
        </el-container>
      </el-card>
      <el-card
        style="margin-top: 4%"
        :md="{span: 8, offset: 8}"
        :sm="{span: 8, offset: 8}"
        :xs="{span: 8, offset: 8}"
      >
        <el-container>
          <el-header class="smalltitle" align="center">{{ excludeTitleTrans[lang] }}</el-header>
          <el-main>
            <el-table
              ref="memberTable"
              style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
              :data="listViewMember"
              border
              align="center"
              @select="handleSelectionMember"
            >
              <el-table-column type="selection" align="center"></el-table-column>
              <el-table-column type="index" width="80" :index="indexMethod2" align="center"></el-table-column>
              <el-table-column
                prop="studentNumber"
                width="180"
                label="Student Number"
                align="center"
              ></el-table-column>
              <el-table-column prop="name" label="Name" align="center"></el-table-column>
            </el-table>
            <el-pagination
              @current-change="handlePageMember"
              :current-page.sync="currentPageMember"
              :page-size="20"
              layout="prev, pager, next, jumper"
              :total="totalMemberSize"
            ></el-pagination>
          </el-main>
          <el-footer style="margin-top: 20px" align="center">
            <el-button @click="exclude">{{ excludeTrans[lang] }}</el-button>
            <el-button @click="toggleShowSelectedMember">{{ toggleShowSelectedTrans[lang] }}</el-button>
          </el-footer>
        </el-container>
      </el-card>
    </el-container>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "nuxt-property-decorator";
import axios from "axios";
import { Translation, Language } from "../types/translation";
import { UserGroup } from "../types/user";
import { ElTableColumn } from "element-ui/types/table-column";
import { ElTable } from "element-ui/types/table";

@Component({})
export default class GroupAdmin extends Vue {
  private userListPending: UserGroup[];
  private userListMember: UserGroup[];
  private currentUserListPending: UserGroup[];
  private currentUserListMember: UserGroup[];
  private listViewPending: UserGroup[];
  private listViewMember: UserGroup[];
  private gid: number;
  private currentPagePending: number;
  private currentPageMember: number;
  private multipleSelectionPending: UserGroup[];
  private multipleSelectionMember: UserGroup[];
  private isShowSelectedPending: boolean;
  private isShowSelectedMember: boolean;
  private latestPageNumberPending: number;
  private latestPageNumberMember: number;
  private totalPendingSize: number;
  private totalMemberSize: number;
  private currentSelectedPending: UserGroup[];
  private currentSelectedMember: UserGroup[];

  private readonly groupAdministrationTrans: Translation = {
    ko: "그룹관리",
    en: "Group Management"
  };

  private groupNameTrans: Translation = {
    ko: "",
    en: ""
  };

  private readonly additionTitleTrans: Translation = {
    ko: "그룹 멤버 추가",
    en: "Add Members"
  };

  private readonly excludeTitleTrans: Translation = {
    ko: "그룹 멤버 제외",
    en: "Exclude Members"
  };

  private readonly additionTrans: Translation = {
    ko: "승인",
    en: "Add"
  };

  private readonly rejectTrans: Translation = {
    ko: "거절",
    en: "Reject"
  };

  private readonly excludeTrans: Translation = {
    ko: "제외",
    en: "Exclude"
  };

  private readonly permissionFailedTrans: Translation = {
    ko: "그룹 멤버 추가에 실패했습니다. 이 그룹에 멤버 신청을 했는지 확인해 주세요.",
    en: "Failed to add a group member. Please check if this user applied to this group."
  };

  private readonly rejectionFailedTrans: Translation = {
    ko: "그룹 멤버 승인 거부에 실패했습니다. 이 그룹에 멤버 신청을 했는지 확인해 주세요.",
    en: "Failed to reject. Please check if this user applied to this group."
  }

  private readonly expelFailedTrans: Translation = {
    ko: "그룹 멤버 제외에 실패했습니다. 그룹의 멤버인지 확인해 주세요.",
    en: "Failed to exclude a group member. Please check if this user is a member of this group."
  };

  private readonly expelSucceedTrans: Translation = {
    ko: " 명의 멤버를 제외했습니다.",
    en: " members excluded."
  }

  private readonly acceptSucceedTrans: Translation = {
    ko: " 명의 멤버를 승인했습니다.",
    en: " members accepted."
  }

  private readonly rejectSucceedTrans: Translation = {
    ko: " 명의 멤버를 거절했습니다.",
    en: " members rejected."
  }

  private readonly noChosenRowTrans: Translation = {
    ko: "관리할 유저를 선택해 주세요.",
    en: "Please select users to admin."
  }

  private readonly toggleShowSelectedTrans: Translation = {
    ko: "선택한 유저만 보기",
    en: "showing selected"
  }

  get lang(): Language {
    return this.$store.state.language;
  }

  private async mounted() {
    this.multipleSelectionPending = [];
    this.multipleSelectionMember = [];
    this.isShowSelectedMember = false;
    this.isShowSelectedPending = false;
    this.gid = Number(this.$route.params.gid);

    var response = await axios.get("/api/check-login", {
      validateStatus: () => true
    });

    if (response.status === 200) {
    } else {
      this.$router.push("/");
      return;
    }

    response = await axios.get("/api/group/", { validateStatus: () => true });

    this.groupNameTrans = response.data.filter(data => data.idx === this.gid)[0].name;

    response = await axios.get("/api/group/" + this.gid + "/pending", {
      validateStatus: () => true
    });

    if (response.status === 401) {
      this.$router.push("/my-page");
      return;
    }

    this.currentPagePending = 1;
    this.currentPageMember = 1;
    this.latestPageNumberPending = this.currentPagePending;
    this.latestPageNumberMember = this.currentPageMember;

    if (!!response.data) {
      this.userListPending = response.data;
      this.userListPending = this.userListPending.sort((a,b) => a.studentNumber > b.studentNumber ? 1 : -1);
      this.currentUserListPending = this.userListPending;
      this.handlePagePending();
    }

    response = await axios.get("/api/group/" + this.gid + "/members", {
      validateStatus: () => true
    });

    if (response.status === 401) {
      this.$router.push("/my-page");
      return;
    }

    this.currentPageMember = 1;

    if (!!response.data) {
      this.userListMember = response.data;
      this.userListMember = this.userListMember.sort((a,b) => a.studentNumber > b.studentNumber ? 1 : -1);
      this.currentUserListMember = this.userListMember;
      this.handlePageMember();
    }

    this.totalPendingSize = this.sizeList();
    this.totalMemberSize = this.sizeList2();
  }

  private async permit() {
    if(!this.multipleSelectionPending) {
      this.$notify.error(this.noChosenRowTrans[this.lang]);
      return;
    }

    var list: number[] = new Array(this.multipleSelectionPending.length);
    var i = 0;

    for (i = 0; i < list.length; i++) {
      list[i] = this.multipleSelectionPending[i].uid;
    }

    const response = await axios.post(
      "/api/group/" + this.gid + "/accept",
      list,
      {
        validateStatus: () => true
      }
    );

    this.isShowSelectedPending = false;
    this.multipleSelectionPending = [];

    if (response.status === 200) {
      this.$router.go(0);
      this.$notify.info(list.length + this.acceptSucceedTrans[this.lang]);
    } else {
      this.$notify.error(this.permissionFailedTrans[this.lang]);
    }
  }

  private async reject() {
    if(!this.multipleSelectionPending) {
      this.$notify.error(this.noChosenRowTrans[this.lang]);
      return;
    }

    var list: number[] = new Array(this.multipleSelectionPending.length);;
    var i = 0;

    for (i = 0; i < list.length; i++) {
      list[i] = this.multipleSelectionPending[i].uid;
    }

    const response = await axios.post(
      "/api/group/" + this.gid + "/reject",
      this.multipleSelectionPending,
      {
        validateStatus: () => true
      }
    );

    this.isShowSelectedPending = false;
    this.multipleSelectionPending = [];

    if (response.status === 200) {
      this.$router.go(0);
      this.$notify.info(list.length + this.rejectSucceedTrans[this.lang]);
    } else {
      this.$notify.error(this.rejectionFailedTrans[this.lang]);
    }
  }

  private async exclude() {
    if(!this.multipleSelectionMember) {
      this.$notify.error(this.noChosenRowTrans[this.lang]);
      return;
    }

    var list: number[] = new Array(this.multipleSelectionMember.length);
    var i = 0;

    if(!list) {
      this.$notify.error(this.noChosenRowTrans[this.lang]);
      return;
    }

    for (i = 0; i < list.length; i++) {
      list[i] = this.multipleSelectionMember[i].uid;
    }

    const response = await axios.post(
      "/api/group/" + this.gid + "/reject",
      list,
      {
        validateStatus: () => true
      }
    );

    this.isShowSelectedMember = false;
    this.multipleSelectionMember = [];

    if (response.status === 200) {
      this.$router.go(0);
      this.$notify.info(list.length + this.expelSucceedTrans[this.lang]);
      return;
    } else {
      this.$notify.error(this.expelFailedTrans[this.lang]);
    }
  }

  private handlePage(pageNumber: number, pageSize: number, userList: UserGroup[]){
    if (pageNumber * pageSize >= userList.length)
      return userList.slice((pageNumber - 1) * pageSize);
    else {
      return userList.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
      );
    }
  }

  private async handlePagePending() {
    var tempSelectedList: UserGroup[] = [...this.multipleSelectionPending];
    // if (this.currentPagePending * 20 >= this.currentUserListPending.length)
    //   this.listViewPending = this.currentUserListPending.slice((this.currentPagePending - 1) * 20);
    // else {
    //   this.listViewPending = this.currentUserListPending.slice(
    //     (this.currentPagePending - 1) * 20,
    //     this.currentPagePending * 20
    //   );
    // }
    this.listViewPending = this.handlePage(this.currentPagePending, 20, this.currentUserListPending);
    this.latestPageNumberPending = this.currentPagePending;
    var tempCurrentSelected: UserGroup[] = this.listViewPending.filter(a => tempSelectedList.indexOf(a) !== -1);
    for(var r in tempCurrentSelected){
      this.$refs.pendingTable.toggleRowSelection(r, true);
    }
    this.multipleSelectionPending = [...tempSelectedList];
  }

  private async handlePageMember() {
    var tempSelectedList: UserGroup[] = [...this.multipleSelectionMember];
    // if (this.currentPageMember * 20 >= this.currentUserListMember.length)
    //   this.listViewMember = this.currentUserListMember.slice((this.currentPageMember - 1) * 20);
    // else {
    //   this.listViewMember = this.currentUserListMember.slice(
    //     (this.currentPageMember - 1) * 20,
    //     this.currentPageMember * 20
    //   );
    // }
    this.listViewMember = this.handlePage(this.currentPageMember, 20, this.currentUserListMember);
    this.latestPageNumberMember = this.currentPageMember;
    var tempCurrentSelected: UserGroup[] = this.listViewMember.filter(a => tempSelectedList.indexOf(a) !== -1);
    for(var r in tempCurrentSelected){
      this.$refs.memberTable.toggleRowSelection(r, true);
    }
    this.multipleSelectionMember = [...tempSelectedList];
  }

  private async toggleShowSelectedPending() {
    if(this.isShowSelectedPending){
      this.isShowSelectedPending = false;
      // if (this.latestPageNumberPending * 20 >= this.userListPending.length)
      //   this.listViewPending = this.userListPending.slice((this.latestPageNumberPending - 1) * 20);
      // else {
      //   this.listViewPending = this.userListPending.slice(
      //     (this.latestPageNumberPending - 1) * 20,
      //     this.latestPageNumberPending * 20
      //   );
      // }
      this.listViewPending = this.handlePage(this.latestPageNumberPending, 20, this.userListPending);
      this.currentPagePending=this.latestPageNumberPending;
      this.totalPendingSize = this.sizeList();
      this.currentUserListPending = this.userListPending;
    }
    else{
      this.isShowSelectedPending = true;
      this.currentPagePending = 1;
      this.totalPendingSize = !this.listViewPending ? 0 : this.listViewPending.length;
      this.currentUserListPending = this.multipleSelectionPending;
      await this.handlePagePending();
    }
  }

  private async toggleShowSelectedMember() {
    if(this.isShowSelectedMember){
      this.isShowSelectedMember = false;
      // if (this.latestPageNumberMember * 20 >= this.userListMember.length)
      //   this.listViewMember = this.userListMember.slice((this.latestPageNumberMember - 1) * 20);
      // else {
      //   this.listViewMember = this.userListMember.slice(
      //     (this.latestPageNumberMember - 1) * 20,
      //     this.latestPageNumberMember * 20
      //   );
      // }
      this.listViewMember = this.handlePage(this.latestPageNumberMember, 20, this.userListMember)
      this.currentPageMember=this.latestPageNumberMember;
      this.totalMemberSize = this.sizeList2();
      this.currentUserListMember = this.userListMember;
    }
    else{
      this.isShowSelectedMember = true;
      this.currentPageMember = 1;
      this.totalMemberSize = !this.listViewMember ? 0 : this.listViewMember.length;
      this.currentUserListMember = this.multipleSelectionMember;
      await this.handlePageMember();
    }
  }

  private distinct = (value, index, self) => {
    return self.indexOf(value) === index;
  }

  private sizeList() {
    if (!this.userListPending) return 0;
    else return this.userListPending.length;
  }

  private sizeList2() {
    if (!this.userListMember) return 0;
    else return this.userListMember.length;
  }

  private indexMethod(index: number) {
    return (this.currentPagePending - 1) * 20 + index + 1;
  }

  private indexMethod2(index: number) {
    return (this.currentPageMember - 1) * 20 + index + 1;
  }

  private handleSelectionPending(val: UserGroup[], row: UserGroup) {
    if(this.multipleSelectionPending.indexOf(row) === -1)
      this.multipleSelectionPending = this.multipleSelectionPending.concat(row);
    else {
      this.multipleSelectionPending = this.multipleSelectionPending.filter(a => a.uid !== row.uid);
    }
  }

  private handleSelectionMember(val: UserGroup[], row: UserGroup) {
    if(this.multipleSelectionMember.indexOf(row) === -1)
      this.multipleSelectionMember = this.multipleSelectionMember.concat(row)
    else {
      this.multipleSelectionMember = this.multipleSelectionMember.filter(a => a.uid !== row.uid);
    }
  }

  private test(val, row){
    console.log(val, row);
  }

  data() {
    return {
      listViewPending: this.listViewPending,
      listViewMember: this.listViewMember,
      currentPagePending: this.currentPagePending,
      currentPageMember: this.currentPageMember,
      multipleSelectionPending: this.multipleSelectionPending,
      multipleSelectionMember: this.multipleSelectionMember,
      totalPendingSize: this.totalPendingSize,
      totalMemberSize: this.totalMemberSize,
      currentUserListPending: this.currentUserListPending,
      currentUserListMember: this.currentUserListMember,
    };
  }
}
</script>

<style scoped>
.groupAdministration {
  font-size: 32px;
  font-weight: 500;
  line-height: 40px;
  text-align: center;
  margin-top: 4%;
}

.title {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 60px;
  text-align: center;
  margin-top: 4%;
  background-color: orange;
  border-width: 1px;
  border-style: solid;
  border-color: orange;
  border-radius: 4px;
}

.subtitle {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 60px;
  text-align: center;
  margin-top: 4%;
  border-color: orange;
  border-width: 1px;
  border-style: solid;
  background-color: rgba(255, 170, 0, 0.4);
  border-radius: 4px;
}

.smalltitle {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 60px;
  text-align: center;
  background-color: rgba(255, 255, 0, 0.7);
  border-color: rgb(255, 255, 0);
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
}

.account {
  margin-top: 8%;
  text-align: center;
  vertical-align: middle;
  margin-right: 20px;
  margin-left: 20px;
}
</style>
