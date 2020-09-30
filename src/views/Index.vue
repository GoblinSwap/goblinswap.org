<template>
  <div class="index_view">
    <p class="index_title">{{this.$t('swap.swap45')}}</p>
    <p class="index_txt">{{this.$t('swap.swap46')}}</p>
    <div class="index_no_txt" v-if="!isStart">{{this.$t('swap.swap52')}}</div>
    <div class="nuls_div" v-else-if="accountDetail && isStart">
      <div class="nuls_pond">
        <div class="nuls_pond_div">
          <p>{{this.$t('swap.swap47')}}</p>
          <p style="color: #6FAF1E;margin-top: 32px;">{{total}}</p>
          <p style="margin-top: 8px;">NULS</p>
        </div>
        <div class="nuls_pond_div">
          <p>{{this.$t('swap.swap41')}}</p>
          <p style="margin-top: 11px;">{{lockBalance}} <span style="color: #6FAF1E;">NULS</span></p>
          <p style="margin-top: 11px;border-top: 1px solid #6FAF1E;"></p>
          <p style="margin-top: 11px;">{{this.$t('swap.swap42')}}</p>
          <p style="margin-top: 11px;">{{earned}} <span style="color: #6FAF1E;">GOBLIN</span></p>
        </div>
      </div>
      <p class="nuls_goblin">{{this.$t('swap.swap48')}}</p>
      <button class="nuls_btn nuls_btn_op" @click="dialogType=5">{{this.$t('swap.swap49')}}</button>
    </div>
    <div class="nuls_div" v-else>
      <div class="nuls_icon"><img src="../assets/img/nuls.png" alt=""></div>
      <p class="nuls_title">{{this.$t('swap.swap50')}}</p>
      <div class="nuls_warehouse">
        <p class="nuls_num">{{total}}</p>
        <p class="nuls_name">NULS</p>
      </div>
      <p class="nuls_goblin">{{this.$t('swap.swap48')}}</p>
      <button class="nuls_btn">{{this.$t('swap.swap49')}}</button>
    </div>
    
    <!-- <p class="index_ps">{{this.$t('swap.swap51')}}: {{addressContract}}</p> -->
    <!-- 创建NULS钱包账户 -->
    <account-create v-if="dialogType==1" @dialogClose="dialogFatherClose"></account-create>
    <!-- 导入NULS钱包私钥 -->
    <account-import v-if="dialogType==2" @dialogClose="dialogFatherClose"></account-import>
    <!-- 备份私钥 -->
    <account-backup v-if="dialogType==3" @dialogClose="dialogFatherClose"></account-backup>
    <!-- 账户详情 -->
    <account-detail v-if="dialogType==4" @dialogClose="dialogFatherClose" :earned="earned"></account-detail>
    <!-- 锁仓 -->
    <lock-dialog v-if="dialogType==5" @dialogClose="dialogFatherClose" :lockBalance="lockBalance" :earned="earned"></lock-dialog>
    <!-- 密码 -->
    <password-bar v-if="dialogType==6" @dialogClose="dialogFatherClose"></password-bar>
    <!-- loading -->
    <loading-bar v-if="dialogType==7" @dialogClose="dialogFatherClose"></loading-bar>
    <!-- 成功提示框 -->
    <succ-bar v-if="dialogType==8" @dialogClose="dialogFatherClose"></succ-bar>
    <!-- 旧合约->新合约  解锁&获取 -->
    <account-transfer v-if="dialogType==9" @dialogClose="dialogFatherClose"></account-transfer>
  </div>
</template>
<script>
import {chainIdNumber,timesDecimals,divisionDecimals,thousands} from '@/api/util'
import accountCreate from "./account/AccountCreate"
import accountImport from "./account/AccountImport"
import accountBackup from "./account/AccountBackup"
import accountDetail from "./account/AccountDetail"
import lockDialog from "./lock/LockDialog"
import passwordBar from "../components/Password"
import loadingBar from "../components/Loading"
import succBar from "../components/Succ"
import accountTransfer from "./account/AccountTransfer"
export default {
  components: {
    accountCreate,
    accountImport,
    accountBackup,
    accountDetail,
    lockDialog,
    passwordBar,
    loadingBar,
    succBar,
    accountTransfer
  },
  data() {
    return {
      dialogType:0,
      accountDetail:"",
      addressContract:"",
      total:"",
      lockBalance:"",
      earned:"",
      isStart:true,//在9月29日开启  true
      addressContractOld:"NULSd6Hgs5jWne1wiyESyJRgRJYnWTkUMi1jx",
      // list:["NULSd6Hge7CyGtPWVmqAAGSWsMEUdZHgXvV8N"],
    };
  },
  mounted() {
    this.$nextTick(function () {
      let that = this;
      let chain = localStorage.getItem(chainIdNumber());
      this.accountDetail = chain?JSON.parse(chain)[0]:"";
      this.addressContract = this.$store.getters.getAddressContract;
      setTimeout(function(){
        that.getTotalSupply();
        if(that.accountDetail){
          that.getBalanceOf();
          that.getEarned();
          that.getBalanceOfOld(that.accountDetail.address);
        }
        setInterval(function(){
          that.getTotalSupply();
          if(that.accountDetail){
            that.getBalanceOf();
            that.getEarned();
          }
        },10000)
      },600)
      
    });
    
  },
  methods: {
    /**
     * 已锁定
     **/
    getBalanceOfOld(address){
      this.$post('/', 'invokeView', [this.addressContractOld,'balanceOf','(Address account) return BigInteger',[address]])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
             let lockBalance = timesDecimals(response.result.result);
             console.log(lockBalance)
             if(lockBalance>0){
               localStorage.setItem("lockBalanceOld",lockBalance)
               this.dialogType = 9
             }
            } else {
              this.$message({message: this.$t('call.call4') + response.error.message, type: 'error', duration: 3000});
            }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call5') + JSON.stringify(error), type: 'error', duration: 3000});
        });
    },
    dialogCreate(){
      this.dialogType = 1;
    },
    dialogDetail(){
      this.dialogType = 4;
    },
    dialogFatherClose(el){
      this.dialogType = el;
    },
    /**
     * 总锁仓
     **/
    getTotalSupply(){
      this.$post('/', 'invokeView', [this.addressContract,'totalSupply','() return BigInteger',[]])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
             this.total = thousands(timesDecimals(response.result.result));
            } else {
              this.$message({message: this.$t('call.call4') + response.error.message, type: 'error', duration: 3000});
            }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call5') + JSON.stringify(error), type: 'error', duration: 3000});
        });
    },
    /**
     * 已锁定
     **/
    getBalanceOf(){
      this.$post('/', 'invokeView', [this.addressContract,'balanceOf','(Address account) return BigInteger',[this.accountDetail.address]])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
             this.lockBalance = timesDecimals(response.result.result);
            } else {
              this.$message({message: this.$t('call.call4') + response.error.message, type: 'error', duration: 3000});
            }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call5') + JSON.stringify(error), type: 'error', duration: 3000});
        });
    },
    /**
     * 挖矿收益
     **/
    getEarned(){
      this.$post('/', 'invokeView', [this.addressContract,'earned','(Address account) return BigInteger',[this.accountDetail.address]])
        .then((response) => {
          if (response.hasOwnProperty("result")) {
            let num = response.result.result>0?response.result.result:0
            this.earned = divisionDecimals(num);
            } else {
              this.$message({message: this.$t('call.call4') + response.error.message, type: 'error', duration: 3000});
            }
        })
        .catch((error) => {
          this.$message({message: this.$t('call.call5') + JSON.stringify(error), type: 'error', duration: 3000});
        });
    },

  },
};
</script>
<style lang="less" scoped>
  
  .index_no_txt {
    min-height: 350px;
    font-size: 38px;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 47px;
    margin-top: 125px;
    text-align: center;
  }

  .index_title {
    font-size: 38px;
    font-weight: 400;
    color: #FFFFFF;
    line-height: 47px;
    margin-top: 125px;
    text-align: center;
    
  }
  .index_txt {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 400;
    color: #BEBEBE;
    line-height: 28px;
  }
  .nuls_div {
    width: 540px;
    background: rgba(34, 34, 34, 0.72);
    border-radius: 22px;
    margin: 40px auto 0px;
    padding: 24px 70px;
    box-sizing: border-box;
    .nuls_pond {
      display: flex;
      justify-content: space-between;
      .nuls_pond_div {
        width: 184px;
        border-radius: 22px;
        opacity: 0.59;
        border: 1px solid #6FAF1E;
        padding: 24px 16px;
        
        p{
          font-size: 16px;
          font-weight: 400;
          color: #BEBEBE;
          line-height: 22px;
        }
      }
    }



    .nuls_btn {
      height: 58px;
      background: #5B5B5B;
      border-radius: 12px;
      width: 100%;
      margin-top: 45px;
      font-size: 20px;
      font-weight: 600;
      color: #8C8C8C;
      line-height: 18px;
      letter-spacing: 1px;
      cursor: pointer;
    }
    .nuls_btn_op {
      color: #FFFFFF;
      background: #6FAF1E;
    }
    .nuls_warehouse {
      height: 104px;
      border-radius: 22px;
      opacity: 0.59;
      border: 1px solid #6FAF1E;
      margin-top: 16px;
      .nuls_num {
        margin-top: 12px;
        font-size: 36px;
        font-weight: 600;
        color: #6FAF1E;
        line-height: 50px;
        letter-spacing: 1px;
      }
      .nuls_name {
        margin-top: 8px;
        font-size: 20px;
        font-weight: 400;
        color: #BEBEBE;
        line-height: 18px;
        letter-spacing: 1px;
      }
    }
    .nuls_goblin {
      margin-top: 16px;
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
      letter-spacing: 1px;
    }
    .nuls_icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin: 0px auto;
      overflow: hidden;
      img{
        width: 100%;
        height: 100%;
      }
    }
    .nuls_title {
      text-align: center;
      margin-top: 10px;
      font-size: 16px;
      font-weight: 400;
      color: #BEBEBE;
      line-height: 18px;
      letter-spacing: 1px;
    }
  }
  
  .index_ps {
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
    line-height: 20px;
    margin-top: 12px;
    display: inline-block;
  }
</style>
